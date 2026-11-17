import type { PropertySummary, PropertyWithMedia, ListingSource, PropertySort } from "@regis/domain";
import { PUBLIC_PROPERTY_STATUSES } from "@regis/domain";

type RawProperty = {
  id: string;
  reference: string;
  slug: string;
  title: string;
  transactionType: PropertySummary["transactionType"];
  propertyType: PropertySummary["propertyType"];
  listingSource: PropertySummary["listingSource"];
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
    listingSource: p.listingSource,
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
    const { getPrisma } = await import("@regis/database");
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
  listingSource?: ListingSource[];
  province?: string;
  municipality?: string;
  neighborhood?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  amenities?: string[];
  q?: string;
  sort?: PropertySort;
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

const SORT_ORDER: Record<string, Record<string, "asc" | "desc">[]> = {
  RECENT: [{ publishedAt: "desc" }],
  PRICE_ASC: [{ priceAmountMinor: "asc" }],
  PRICE_DESC: [{ priceAmountMinor: "desc" }],
  AREA_DESC: [{ areaM2: "desc" }],
  FEATURED: [{ featured: "desc" }, { publishedAt: "desc" }],
};

export async function searchProperties(
  input: PropertySearchInput,
): Promise<PropertySearchResult> {
  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, input.pageSize ?? DEFAULT_PAGE_SIZE));

  if (!databaseConfigured()) {
    return { items: [], total: 0, page, pageCount: 0 };
  }

  try {
    const { getPrisma } = await import("@regis/database");
    const prisma = await getPrisma();
    const where: Record<string, unknown> = { status: "PUBLISHED" };

    if (input.transactionType) where.transactionType = input.transactionType;
    if (input.propertyType) where.propertyType = input.propertyType;
    if (input.province) where.province = input.province;
    if (input.municipality) where.municipality = input.municipality;
    if (input.neighborhood) where.neighborhood = input.neighborhood;

    // Listing source: empty array = no filter (show all).
    if (input.listingSource && input.listingSource.length === 1) {
      where.listingSource = input.listingSource[0];
    } else if (input.listingSource && input.listingSource.length > 1) {
      where.listingSource = { in: input.listingSource };
    }

    const price: Record<string, bigint> = {};
    if (input.minPrice != null) price.gte = BigInt(Math.round(input.minPrice * 100));
    if (input.maxPrice != null) price.lte = BigInt(Math.round(input.maxPrice * 100));
    if (Object.keys(price).length > 0) where.priceAmountMinor = price;

    // Tipologia: 0 = studios only (exact); 1+ = minimum bedrooms.
    if (input.bedrooms != null) {
      where.bedrooms = input.bedrooms === 0 ? 0 : { gte: input.bedrooms };
    }
    if (input.bathrooms != null) where.bathrooms = { gte: input.bathrooms };

    const area: Record<string, number> = {};
    if (input.minArea != null) area.gte = input.minArea;
    if (input.maxArea != null) area.lte = input.maxArea;
    if (Object.keys(area).length > 0) where.areaM2 = area;

    if (input.amenities && input.amenities.length > 0) {
      where.amenities = { hasEvery: input.amenities };
    }

    // Text search across title, description, reference, location and amenities.
    if (input.q) {
      const q = input.q;
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { reference: { contains: q, mode: "insensitive" } },
        { municipality: { contains: q, mode: "insensitive" } },
        { neighborhood: { contains: q, mode: "insensitive" } },
        { amenities: { has: q } },
      ];
    }

    const orderBy = SORT_ORDER[input.sort ?? "RECENT"] ?? SORT_ORDER.RECENT;

    const total = await prisma.property.count({ where });
    const rows = await prisma.property.findMany({
      where,
      orderBy,
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

/**
 * Parses the raw URL query into a typed search input.
 * `listingSource` accepts repeated params or a comma-separated value.
 */
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

  // listingSource: repeated keys or comma-separated
  const rawSource = params.listingSource;
  const sourceParts = (Array.isArray(rawSource) ? rawSource : rawSource ? [rawSource] : [])
    .flatMap((v) => v.split(","))
    .map((s) => s.trim().toUpperCase())
    .filter((s): s is ListingSource => s === "PROFESSIONAL" || s === "PRIVATE");

  const amenitiesRaw = one("amenities");
  const amenities = amenitiesRaw
    ? amenitiesRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : undefined;

  return {
    transactionType: one("transactionType"),
    propertyType: one("propertyType"),
    listingSource: sourceParts.length > 0 ? [...new Set(sourceParts)] : undefined,
    province: one("province"),
    municipality: one("municipality"),
    neighborhood: one("neighborhood"),
    minPrice: num("minPrice"),
    maxPrice: num("maxPrice"),
    bedrooms: num("bedrooms"),
    bathrooms: num("bathrooms"),
    minArea: num("minArea"),
    maxArea: num("maxArea"),
    amenities: amenities && amenities.length > 0 ? amenities : undefined,
    q: one("q"),
    sort: one("sort") as PropertySort | undefined,
    page: num("page") ?? 1,
  };
}

/** Serialises a search input back to a query string (omitting empty values). */
export function buildQueryString(
  input: PropertySearchInput,
  overrides: Partial<PropertySearchInput> = {},
): string {
  const merged = { ...input, ...overrides };
  const search = new URLSearchParams();

  const set = (key: string, value: string | number | undefined | null) => {
    if (value == null || value === "") search.delete(key);
    else search.set(key, String(value));
  };

  set("transactionType", merged.transactionType);
  set("propertyType", merged.propertyType);
  set("province", merged.province);
  set("municipality", merged.municipality);
  set("neighborhood", merged.neighborhood);
  set("minPrice", merged.minPrice);
  set("maxPrice", merged.maxPrice);
  set("bedrooms", merged.bedrooms);
  set("bathrooms", merged.bathrooms);
  set("minArea", merged.minArea);
  set("maxArea", merged.maxArea);
  set("q", merged.q);
  set("sort", merged.sort);
  set("page", merged.page && merged.page > 1 ? merged.page : undefined);

  if (merged.listingSource && merged.listingSource.length > 0) {
    search.set("listingSource", merged.listingSource.join(","));
  } else {
    search.delete("listingSource");
  }

  if (merged.amenities && merged.amenities.length > 0) {
    search.set("amenities", merged.amenities.join(","));
  } else {
    search.delete("amenities");
  }

  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

// --- Filter options ----------------------------------------------------------

/** Distinct municipality names for a province (falls back to free values). */
export async function getMunicipalities(province?: string): Promise<string[]> {
  if (!province || !databaseConfigured()) return [];
  try {
    const { getPrisma } = await import("@regis/database");
    const prisma = await getPrisma();
    const rows = await prisma.property.findMany({
      where: { status: { in: [...PUBLIC_PROPERTY_STATUSES] }, province },
      distinct: ["municipality"],
      select: { municipality: true },
      orderBy: { municipality: "asc" },
    });
    return rows.map((r) => r.municipality);
  } catch {
    return [];
  }
}

/** Distinct neighborhood names for a province/municipality. */
export async function getNeighborhoods(
  province?: string,
  municipality?: string,
): Promise<string[]> {
  if (!province || !municipality || !databaseConfigured()) return [];
  try {
    const { getPrisma } = await import("@regis/database");
    const prisma = await getPrisma();
    const rows = await prisma.property.findMany({
      where: {
        status: { in: [...PUBLIC_PROPERTY_STATUSES] },
        province,
        municipality,
        neighborhood: { not: null },
      },
      distinct: ["neighborhood"],
      select: { neighborhood: true },
      orderBy: { neighborhood: "asc" },
    });
    return rows.map((r) => r.neighborhood).filter((n): n is string => !!n);
  } catch {
    return [];
  }
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

  const images = media.filter((m) => m.type === "IMAGE");
  const videos = media.filter((m) => m.type === "VIDEO");

  return {
    id: p.id,
    reference: p.reference,
    slug: p.slug,
    title: p.title,
    description: p.description,
    transactionType: p.transactionType,
    propertyType: p.propertyType,
    listingSource: p.listingSource,
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
    mainImageUrl: images[0]?.url ?? videos[0]?.url ?? null,
  };
}

/**
 * Loads a single property for its public detail page. Only PUBLISHED/RESERVED
 * listings are returned — drafts, sold, rented and archived records 404.
 */
export async function getPropertyBySlug(slug: string): Promise<PropertyWithMedia | null> {
  if (!databaseConfigured()) return null;

  try {
    const { getPrisma } = await import("@regis/database");
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
    const { getPrisma } = await import("@regis/database");
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
    const { getPrisma } = await import("@regis/database");
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
