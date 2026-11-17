import { z } from "zod";
import {
  ListingSource,
  PropertySort,
  PropertyType,
  TransactionType,
} from "@regis/domain";

const enumValues = <T extends Record<string, string>>(e: T) =>
  Object.values(e) as [string, ...string[]];

const amenityList = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((v): string[] => {
    if (v === undefined) return [];
    return (Array.isArray(v) ? v : v.split(",")).map((s) => s.trim()).filter(Boolean);
  });

const optionalNumber = z.coerce.number().nonnegative().optional();

/**
 * Tipologia filter (T0–T5). Encoded as the minimum bedroom count:
 * T0 → 0 (studio), T1 → 1+, … T5 → 5+. Accepts "T2" or "2".
 */
export const tipologiaSchema = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v): number | undefined => {
    if (v === undefined || v === "") return undefined;
    const s = String(v).trim().toUpperCase().replace(/^T/, "");
    const n = Number(s);
    if (!Number.isInteger(n) || n < 0 || n > 10) return undefined;
    return n;
  });

/**
 * Listing source filter. Accepts "PROFESSIONAL", "PRIVATE", comma-separated
 * lists, or arrays (from repeated query params). Empty/absent = no filter.
 */
const listingSourceList = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((v): ListingSource[] => {
    if (v === undefined) return [];
    const parts = (Array.isArray(v) ? v : v.split(","))
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    const valid = new Set(Object.values(ListingSource));
    return parts.filter((p): p is ListingSource => valid.has(p as ListingSource));
  });

/** Query parameters for property search. Accepts string (URL) or number input. */
export const propertySearchSchema = z
  .object({
    transactionType: z.enum(enumValues(TransactionType)).optional(),
    propertyType: z.enum(enumValues(PropertyType)).optional(),
    listingSource: listingSourceList,
    province: z.string().trim().min(1).optional(),
    municipality: z.string().trim().min(1).optional(),
    neighborhood: z.string().trim().min(1).optional(),
    minPrice: optionalNumber,
    maxPrice: optionalNumber,
    bedrooms: z.coerce.number().int().min(0).max(50).optional(),
    bathrooms: z.coerce.number().int().min(0).max(50).optional(),
    tipologia: tipologiaSchema,
    minArea: optionalNumber,
    maxArea: optionalNumber,
    amenities: amenityList,
    q: z.string().trim().max(200).optional(),
    featured: z
      .union([z.literal("true"), z.literal("false"), z.boolean()])
      .optional()
      .transform((v) => (v === undefined ? undefined : v === true || v === "true")),
    sort: z.enum(enumValues(PropertySort)).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(48).default(12),
  })
  .refine(
    (s) => s.minPrice === undefined || s.maxPrice === undefined || s.minPrice <= s.maxPrice,
    { message: "O preço mínimo não pode ser superior ao preço máximo.", path: ["minPrice"] },
  )
  .refine(
    (s) => s.minArea === undefined || s.maxArea === undefined || s.minArea <= s.maxArea,
    { message: "A área mínima não pode ser superior à área máxima.", path: ["minArea"] },
  );

export type PropertySearchInput = z.input<typeof propertySearchSchema>;
export type PropertySearch = z.output<typeof propertySearchSchema>;

export function parsePropertySearch(input: unknown): PropertySearch {
  return propertySearchSchema.parse(input);
}

export function safeParsePropertySearch(input: unknown) {
  return propertySearchSchema.safeParse(input);
}
