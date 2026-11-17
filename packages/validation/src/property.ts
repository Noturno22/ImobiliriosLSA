import { z } from "zod";
import { ListingSource, PropertyStatus, PropertyType, TransactionType } from "@regis/domain";
import { priceInputSchema } from "./money";

const enumValues = <T extends Record<string, string>>(e: T) =>
  Object.values(e) as [string, ...string[]];

export const propertyBaseSchema = z.object({
  title: z.string().trim().min(6, "O tÃ­tulo Ã© demasiado curto.").max(160),
  description: z.string().trim().min(20, "A descriÃ§Ã£o Ã© demasiado curta.").max(8000),
  transactionType: z.enum(enumValues(TransactionType)),
  propertyType: z.enum(enumValues(PropertyType)),
  listingSource: z
    .enum(enumValues(ListingSource))
    .default(ListingSource.PROFESSIONAL),
  status: z.enum(enumValues(PropertyStatus)).default(PropertyStatus.DRAFT),
  price: priceInputSchema,
  province: z.string().trim().min(1, "Selecione a provÃ­ncia."),
  municipality: z.string().trim().min(1, "Selecione o municÃ­pio."),
  neighborhood: z.string().trim().max(120).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  bedrooms: z.number().int().min(0).max(50).optional(),
  bathrooms: z.number().int().min(0).max(50).optional(),
  parkingSpaces: z.number().int().min(0).max(100).optional(),
  areaM2: z.number().nonnegative().max(1_000_000).optional(),
  lotAreaM2: z.number().nonnegative().max(100_000_000).optional(),
  amenities: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
});

export const propertyCreateSchema = propertyBaseSchema;
export const propertyUpdateSchema = propertyBaseSchema.partial();

export const propertyMediaCreateSchema = z.object({
  url: z.string().url(),
  type: z.enum(["IMAGE", "VIDEO", "PANORAMA", "FLOORPLAN", "MODEL_3D"]).default("IMAGE"),
  alt: z.string().trim().max(200).default(""),
  displayOrder: z.number().int().min(0).default(0),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  caption: z.string().trim().max(240).optional(),
});

export type PropertyCreateInput = z.infer<typeof propertyCreateSchema>;
export type PropertyUpdateInput = z.infer<typeof propertyUpdateSchema>;
