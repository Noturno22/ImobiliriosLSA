"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  Currency,
  Permission,
  PropertyStatus,
  PropertyType,
  TransactionType,
  fromMajor,
  hasPermission,
} from "@regis/domain";
import { propertyCreateSchema } from "@regis/validation";
import type { PrismaClient } from "@regis/database";
import { auth } from "@/auth";
import { saveUploadedImages } from "@/lib/uploads";

export interface PropertyFormState {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

function str(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Parses human money/number input ("350 000 000", "1.234,5"). */
function num(value: FormDataEntryValue | null): number | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = value.trim().replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  if (!cleaned) return undefined;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function slugify(input: string): string {
  return (
    input
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "imovel"
  );
}

async function nextReference(prisma: PrismaClient): Promise<string> {
  const last = await prisma.property.findFirst({
    orderBy: { reference: "desc" },
    select: { reference: true },
  });
  const digits = last ? /RGS-(\d+)/.exec(last.reference)?.[1] : undefined;
  const next = digits ? Number.parseInt(digits, 10) + 1 : 1;
  return `RGS-${String(next).padStart(6, "0")}`;
}

async function uniqueSlug(prisma: PrismaClient, title: string, reference: string): Promise<string> {
  const base = `${slugify(title)}-${reference.toLowerCase()}`;
  let slug = base;
  let counter = 2;
  while (await prisma.property.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
}

function resolvePublishedAt(
  status: string,
  current: Date | null | undefined,
): Date | null {
  if (status !== PropertyStatus.PUBLISHED) return null;
  return current ?? new Date();
}

/** Creates or updates a property (and replaces its media) from the admin form. */
export async function saveProperty(
  _prevState: PropertyFormState,
  formData: FormData,
): Promise<PropertyFormState> {
  const session = await auth();
  if (!session?.user) throw new Error("Sessão inválida.");
  if (!hasPermission(session.user.role, Permission.PROPERTY_WRITE)) {
    return { error: "Não tem permissão para gerir imóveis." };
  }

  const id = str(formData.get("id"));
  const textUrls = str(formData.get("mediaUrls"))
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const files = formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const { urls: uploadedUrls } = await saveUploadedImages(files);
  const mediaUrls = [...uploadedUrls, ...textUrls];

  const parsed = propertyCreateSchema.safeParse({
    title: str(formData.get("title")),
    description: str(formData.get("description")),
    transactionType: str(formData.get("transactionType")),
    propertyType: str(formData.get("propertyType")),
    status: str(formData.get("status")) || undefined,
    price: {
      amountMajor: num(formData.get("priceAmountMajor")) ?? -1,
      currency: str(formData.get("priceCurrency")) || "AOA",
    },
    province: str(formData.get("province")),
    municipality: str(formData.get("municipality")),
    neighborhood: str(formData.get("neighborhood")) || undefined,
    bedrooms: num(formData.get("bedrooms")),
    bathrooms: num(formData.get("bathrooms")),
    parkingSpaces: num(formData.get("parkingSpaces")),
    areaM2: num(formData.get("areaM2")),
    lotAreaM2: num(formData.get("lotAreaM2")),
    amenities: formData.getAll("amenities").map((a) => String(a)),
    featured: formData.get("featured") === "on",
  });

  if (!parsed.success) {
    return {
      error: "Verifique os campos assinalados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const price = fromMajor(data.price.amountMajor, data.price.currency as Currency);
  const transactionType = data.transactionType as TransactionType;
  const propertyType = data.propertyType as PropertyType;
  const status = data.status as PropertyStatus;

  const { getPrisma } = await import("@regis/database");
  const prisma = await getPrisma();

  try {
    if (id) {
      const existing = await prisma.property.findUnique({
        where: { id },
        select: { publishedAt: true },
      });
      if (!existing) return { error: "Imóvel não encontrado." };

      await prisma.$transaction(async (tx) => {
        await tx.property.update({
          where: { id },
          data: {
            title: data.title,
            description: data.description,
            transactionType,
            propertyType,
            status,
            priceAmountMinor: BigInt(price.amountMinor),
            priceCurrency: price.currency,
            province: data.province,
            municipality: data.municipality,
            neighborhood: data.neighborhood ?? null,
            bedrooms: data.bedrooms ?? null,
            bathrooms: data.bathrooms ?? null,
            parkingSpaces: data.parkingSpaces ?? null,
            areaM2: data.areaM2 ?? null,
            lotAreaM2: data.lotAreaM2 ?? null,
            amenities: data.amenities,
            featured: data.featured,
            publishedAt: resolvePublishedAt(status, existing.publishedAt),
          },
        });
        await tx.propertyMedia.deleteMany({ where: { propertyId: id } });
        if (mediaUrls.length > 0) {
          await tx.propertyMedia.createMany({
            data: mediaUrls.map((url, index) => ({
              propertyId: id,
              url,
              alt: data.title,
              displayOrder: index,
            })),
          });
        }
      });
    } else {
      const reference = await nextReference(prisma);
      const slug = await uniqueSlug(prisma, data.title, reference);

      await prisma.$transaction(async (tx) => {
        const created = await tx.property.create({
          data: {
            reference,
            slug,
            title: data.title,
            description: data.description,
            transactionType,
            propertyType,
            status,
            priceAmountMinor: BigInt(price.amountMinor),
            priceCurrency: price.currency,
            province: data.province,
            municipality: data.municipality,
            neighborhood: data.neighborhood ?? null,
            bedrooms: data.bedrooms ?? null,
            bathrooms: data.bathrooms ?? null,
            parkingSpaces: data.parkingSpaces ?? null,
            areaM2: data.areaM2 ?? null,
            lotAreaM2: data.lotAreaM2 ?? null,
            amenities: data.amenities,
            featured: data.featured,
            publishedAt: resolvePublishedAt(status, null),
          },
        });
        if (mediaUrls.length > 0) {
          await tx.propertyMedia.createMany({
            data: mediaUrls.map((url, index) => ({
              propertyId: created.id,
              url,
              alt: data.title,
              displayOrder: index,
            })),
          });
        }
      });
    }
  } catch (error) {
    console.error("[admin] saveProperty failed:", error);
    return { error: "Não foi possível guardar o imóvel. Tente novamente." };
  }

  revalidatePath("/admin/imoveis");
  revalidatePath("/admin");
  revalidatePath("/imoveis");
  redirect("/admin/imoveis");
}

/** Changes only the listing status (publish / reserve / archive …). */
export async function setPropertyStatus(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Sessão inválida.");
  if (!hasPermission(session.user.role, Permission.PROPERTY_PUBLISH)) {
    throw new Error("Sem permissão para alterar o estado.");
  }

  const id = str(formData.get("id"));
  const status = str(formData.get("status"));
  if (!id || !(Object.values(PropertyStatus) as string[]).includes(status)) return;

  const { getPrisma } = await import("@regis/database");
  const prisma = await getPrisma();

  const existing = await prisma.property.findUnique({
    where: { id },
    select: { publishedAt: true },
  });
  if (!existing) return;

  await prisma.property.update({
    where: { id },
    data: {
      status: status as PropertyStatus,
      publishedAt: resolvePublishedAt(status, existing.publishedAt),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "property.status.update",
      entity: "Property",
      entityId: id,
      metadata: { status },
    },
  });

  revalidatePath("/admin/imoveis");
  revalidatePath(`/admin/imoveis/${id}`);
  revalidatePath("/admin");
  revalidatePath("/imoveis");
}
