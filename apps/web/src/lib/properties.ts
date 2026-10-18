import type { PropertySummary, PropertyWithMedia } from "@serrote/domain";
import { PUBLIC_PROPERTY_STATUSES } from "@serrote/domain";

type RawProperty = {
  id: string;
  reference: string;
  slug: string;
  title: string;
  transactionType: PropertySummary["transactionType"];
  propertyType: PropertySummary["propertyType"];
  status: PropertySummary["status"];
  priceAmountMinor: bigint;
  priceCurrency: PropertySummary["price"]["currency"];
  province: string;
  municipality: string;
  neighborhood: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  areaM2: number | null;
  featured: boolean;
  publishedAt: Date | null;
  media: { url: string }[];
};

function toSummary(p: RawProperty): PropertySummary {
  return {
    id: p.id,
    reference: p.reference,
    slug: p.slug,
    title: p.title,
    transactionType: p.transactionType,
    propertyType: p.propertyType,
    status: p.status,
    price: { amountMinor: Number(p.priceAmountMinor), currency: p.priceCurrency },
    province: p.province,
    municipality: p.municipality,
    neighborhood: p.neighborhood,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    areaM2: p.areaM2,
    featured: p.featured,
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    mainImageUrl: p.media[0]?.url ?? null,
  };
}

const MEDIA_INCLUDE = { orderBy: { displayOrder: "asc" as const }, take: 1 };

function databaseConfigured(): boolean {
  // Skip the database during `next build` so embedded PGlite (a single-process
  // database) is never opened concurrently by build workers. Pages that read
  // from the database render on demand at runtime.
  if (process.env.NEXT_PHASE === "phase-production-build") return false;
  return !!process.env.DATABASE_URL?.trim();
}

export async function getFeaturedProperties(limit = 6): Promise<PropertySummary[]> {
  if (!databaseConfigured()) return [];

  try {
    const { getPrisma } = await import("@serrote/database");
    const prisma = await getPrisma();
    const [featuredRows, remainingRows] = await Promise.all([
      prisma.property.findMany({
        where: { status: "PUBLISHED", featured: true },
        orderBy: [{ publishedAt: "desc" }],
        take: limit,
        include: { media: MEDIA_INCLUDE },
      }),
      prisma.property.findMany({
        where: { status: "PUBLISHED", featured: false },
        orderBy: [{ publishedAt: "desc" }],
        take: limit,
        include: { media: MEDIA_INCLUDE },
      }),
    ]);

    const seen = new Set<string>();
    const rows: RawProperty[] = [];
    for (const row of [...featuredRows, ...remainingRows] as unknown as RawProperty[]) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      rows.push(row);
      if (rows.length >= limit) break;
    }

    return rows.map(toSummary);
  } catch (error) {
    console.error("[properties] failed to load featured properties:", error);
    return [];
  }
}

export interface PropertySearchInput {
  transactionType?: string;
  propertyType?: string;
  province?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  page?: number;
  pageSize?: number;
}

export interface PropertySearchResult {
  items: PropertySummary[];
  total: number;
  page: number;
  pageCount: number;
}

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 48;

export async function searchProperties(
  input: PropertySearchInput,
): Promise<PropertySearchResult> {
  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, input.pageSize ?? DEFAULT_PAGE_SIZE));

  if (!databaseConfigured()) {
    return { items: [], total: 0, page, pageCount: 0 };
  }

  try {
    const { getPrisma } = await import("@serrote/database");
    const prisma = await getPrisma();
    const where: Record<string, unknown> = { status: "PUBLISHED" };

    if (input.transactionType) where.transactionType = input.transactionType;
    if (input.propertyType) where.propertyType = input.propertyType;
    if (input.province) where.province = input.province;

    const price: Record<string, bigint> = {};
    if (input.minPrice != null) price.gte = BigInt(Math.round(input.minPrice * 100));
    if (input.maxPrice != null) price.lte = BigInt(Math.round(input.maxPrice * 100));
    if (Object.keys(price).length > 0) where.priceAmountMinor = price;

    if (input.bedrooms != null) where.bedrooms = { gte: input.bedrooms };
    if (input.bathrooms != null) where.bathrooms = { gte: input.bathrooms };

    const total = await prisma.property.count({ where });
    const rows = await prisma.property.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { media: MEDIA_INCLUDE },
    });

    return {
      items: (rows as unknown as RawProperty[]).map(toSummary),
      total,
      page,
      pageCount: Math.ceil(total / pageSize),
    };
  } catch (error) {
    console.error("[properties] search failed:", error);
    return { items: [], total: 0, page, pageCount: 0 };
  }
}

export function parseSearchParams(
  params: Record<string, string | string[] | undefined>,
): PropertySearchInput {
  const one = (key: string): string | undefined => {
    const v = params[key];
    const s = Array.isArray(v) ? v[0] : v;
    return s?.trim() || undefined;
  };
  const num = (key: string): number | undefined => {
    const s = one(key);
    if (s == null) return undefined;
    const n = Number(s.replace(/\s/g, "").replace(/\./g, "").replace(",", "."));
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  };

  return {
    transactionType: one("transactionType"),
    propertyType: one("propertyType"),
    province: one("province"),
    minPrice: num("minPrice"),
    maxPrice: num("maxPrice"),
    bedrooms: num("bedrooms"),
    bathrooms: num("bathrooms"),
    page: num("page") ?? 1,
  };
}

// --- Property detail ---------------------------------------------------------

type RawMedia = {
  id: string;
  url: string;
  type: PropertyWithMedia["media"][number]["type"];
  alt: string;
  displayOrder: number;
  width: number | null;
  height: number | null;
  caption: string | null;
};

type RawPropertyDetail = Omit<RawProperty, "media"> & {
  description: string;
  latitude: number | null;
  longitude: number | null;
  parkingSpaces: number | null;
  lotAreaM2: number | null;
  amenities: string[];
  createdAt: Date;
  updatedAt: Date;
  media: RawMedia[];
};

/** Statuses allowed to appear on public pages. Kept as a plain array for Prisma. */
const PUBLIC_STATUS_FILTER = [...PUBLIC_PROPERTY_STATUSES];

function toDetail(p: RawPropertyDetail): PropertyWithMedia {
  const media = p.media.map((m) => ({
    id: m.id,
    propertyId: p.id,
    url: m.url,
    type: m.type,
    alt: m.alt || p.title,
    displayOrder: m.displayOrder,
    width: m.width,
    height: m.height,
    caption: m.caption,
  }));

  return {
    id: p.id,
    reference: p.reference,
    slug: p.slug,
    title: p.title,
    description: p.description,
    transactionType: p.transactionType,
    propertyType: p.propertyType,
    status: p.status,
    price: { amountMinor: Number(p.priceAmountMinor), currency: p.priceCurrency },
    province: p.province,
    municipality: p.municipality,
    neighborhood: p.neighborhood,
    latitude: p.latitude,
    longitude: p.longitude,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    parkingSpaces: p.parkingSpaces,
    areaM2: p.areaM2,
    lotAreaM2: p.lotAreaM2,
    amenities: p.amenities,
    featured: p.featured,
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    media,
    mainImageUrl: media[0]?.url ?? null,
  };
}

/**
 * Loads a single property for its public detail page. Only PUBLISHED/RESERVED
 * listings are returned — drafts, sold, rented and archived records 404.
 */
export async function getPropertyBySlug(slug: string): Promise<PropertyWithMedia | null> {
  if (!databaseConfigured()) return null;

  try {
    const { getPrisma } = await import("@serrote/database");
    const prisma = await getPrisma();
    const row = await prisma.property.findFirst({
      where: { slug, status: { in: PUBLIC_STATUS_FILTER } },
      include: { media: { orderBy: { displayOrder: "asc" } } },
    });
    if (!row) return null;
    return toDetail(row as unknown as RawPropertyDetail);
  } catch (error) {
    console.error("[properties] failed to load property by slug:", error);
    return null;
  }
}

/** Related listings: same type or province, featured first, excluding the current one. */
export async function getSimilarProperties(
  property: Pick<PropertyWithMedia, "id" | "province" | "propertyType">,
  limit = 3,
): Promise<PropertySummary[]> {
  if (!databaseConfigured()) return [];

  try {
    const { getPrisma } = await import("@serrote/database");
    const prisma = await getPrisma();
    const rows = await prisma.property.findMany({
      where: {
        status: { in: PUBLIC_STATUS_FILTER },
        id: { not: property.id },
        OR: [{ propertyType: property.propertyType }, { province: property.province }],
      },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      take: limit,
      include: { media: MEDIA_INCLUDE },
    });
    return (rows as unknown as RawProperty[]).map(toSummary);
  } catch (error) {
    console.error("[properties] failed to load similar properties:", error);
    return [];
  }
}

/** Slugs of all publicly visible properties — used to build the XML sitemap. */
export async function getPublishedPropertySlugs(): Promise<
  { slug: string; updatedAt: Date }[]
> {
  if (!databaseConfigured()) return [];

  try {
    const { getPrisma } = await import("@serrote/database");
    const prisma = await getPrisma();
    const rows = await prisma.property.findMany({
      where: { status: { in: PUBLIC_STATUS_FILTER } },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5000,
    });
    return rows as { slug: string; updatedAt: Date }[];
  } catch (error) {
    console.error("[properties] failed to load property slugs:", error);
    return [];
  }
}
