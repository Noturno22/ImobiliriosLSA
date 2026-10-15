import Link from "next/link";
import { notFound } from "next/navigation";
import { Currency, PropertyStatus, PropertyType, TransactionType, toMajor } from "@serrote/domain";
import { PropertyForm, type PropertyFormValues } from "@/components/admin/property-form";
import { statusLabels } from "@/lib/labels";
import { setPropertyStatus } from "../actions";

export const dynamic = "force-dynamic";

const QUICK_STATUSES: PropertyStatus[] = [
  PropertyStatus.DRAFT,
  PropertyStatus.PUBLISHED,
  PropertyStatus.RESERVED,
  PropertyStatus.SOLD,
  PropertyStatus.RENTED,
  PropertyStatus.ARCHIVED,
];

function toField(value: number | null): string {
  return value == null ? "" : String(value);
}

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { getPrisma } = await import("@serrote/database");
  const prisma = await getPrisma();

  const property = await prisma.property.findUnique({
    where: { id },
    include: { media: { orderBy: { displayOrder: "asc" } } },
  });
  if (!property) notFound();

  const values: PropertyFormValues = {
    id: property.id,
    title: property.title,
    description: property.description,
    transactionType: property.transactionType as TransactionType,
    propertyType: property.propertyType as PropertyType,
    status: property.status as PropertyStatus,
    priceAmountMajor: String(toMajor({ amountMinor: Number(property.priceAmountMinor), currency: property.priceCurrency as Currency })),
    priceCurrency: property.priceCurrency as Currency,
    province: property.province,
    municipality: property.municipality,
    neighborhood: property.neighborhood ?? "",
    bedrooms: toField(property.bedrooms),
    bathrooms: toField(property.bathrooms),
    parkingSpaces: toField(property.parkingSpaces),
    areaM2: toField(property.areaM2),
    lotAreaM2: toField(property.lotAreaM2),
    amenities: property.amenities,
    featured: property.featured,
    mediaUrls: property.media.map((m) => m.url).join("\n"),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/imoveis" className="text-sm text-ink-muted hover:text-orange">
            ← Imóveis
          </Link>
          <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-navy">
            {property.title}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            <span className="font-mono">{property.reference}</span> · Estado atual:{" "}
            <strong className="text-navy">{statusLabels[property.status]}</strong>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {QUICK_STATUSES.filter((status) => status !== property.status).map((status) => (
            <form key={status} action={setPropertyStatus}>
              <input type="hidden" name="id" value={property.id} />
              <input type="hidden" name="status" value={status} />
              <button
                type="submit"
                className="rounded-control border border-line-strong px-3 py-2 text-xs font-semibold text-ink-muted transition-colors hover:border-orange hover:text-orange"
              >
                {statusLabels[status]}
              </button>
            </form>
          ))}
        </div>
      </div>

      <PropertyForm values={values} />
    </div>
  );
}
