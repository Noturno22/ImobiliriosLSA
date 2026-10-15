import { z } from "zod";
import { PropertySort, PropertyType, TransactionType } from "@serrote/domain";

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

/** Query parameters for property search. Accepts string (URL) or number input. */
export const propertySearchSchema = z
  .object({
    transactionType: z.enum(enumValues(TransactionType)).optional(),
    propertyType: z.enum(enumValues(PropertyType)).optional(),
    province: z.string().trim().min(1).optional(),
    municipality: z.string().trim().min(1).optional(),
    neighborhood: z.string().trim().min(1).optional(),
    minPrice: optionalNumber,
    maxPrice: optionalNumber,
    bedrooms: z.coerce.number().int().min(0).max(50).optional(),
    bathrooms: z.coerce.number().int().min(0).max(50).optional(),
    minArea: optionalNumber,
    maxArea: optionalNumber,
    amenities: amenityList,
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
