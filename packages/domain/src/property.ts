import type { Money } from "./money";
import type {
  MediaType,
  PropertyStatus,
  PropertyType,
  TransactionType,
} from "./enums";

export interface PropertyMedia {
  id: string;
  propertyId: string;
  url: string;
  type: MediaType;
  alt: string;
  displayOrder: number;
  width?: number | null;
  height?: number | null;
  caption?: string | null;
}

export interface Property {
  id: string;
  /** Public reference shown to customers, e.g. "SRT-000123". */
  reference: string;
  slug: string;
  title: string;
  description: string;
  transactionType: TransactionType;
  propertyType: PropertyType;
  status: PropertyStatus;
  price: Money;
  province: string;
  municipality: string;
  neighborhood?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parkingSpaces?: number | null;
  /** Built area in square metres. */
  areaM2?: number | null;
  /** Lot area in square metres. */
  lotAreaM2?: number | null;
  amenities: readonly string[];
  featured: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyWithMedia extends Property {
  media: readonly PropertyMedia[];
  mainImageUrl?: string | null;
}

export interface PropertySummary
  extends Pick<
    Property,
    | "id"
    | "reference"
    | "slug"
    | "title"
    | "transactionType"
    | "propertyType"
    | "status"
    | "price"
    | "province"
    | "municipality"
    | "neighborhood"
    | "bedrooms"
    | "bathrooms"
    | "areaM2"
    | "featured"
    | "publishedAt"
  > {
  mainImageUrl?: string | null;
}

/** Amenity catalogue â€” drives filters. Extend only with real, supported values. */
export const AMENITIES = [
  { key: "swimming_pool", label: "Piscina" },
  { key: "garden", label: "Jardim" },
  { key: "garage", label: "Garagem" },
  { key: "security", label: "SeguranÃ§a 24h" },
  { key: "generator", label: "Gerador" },
  { key: "borehole", label: "Furo de Ã¡gua" },
  { key: "air_conditioning", label: "Ar condicionado" },
  { key: "balcony", label: "Varanda" },
  { key: "furnished", label: "Mobilado" },
  { key: "elevator", label: "Elevador" },
  { key: "sea_view", label: "Vista mar" },
  { key: "gym", label: "GinÃ¡sio" },
] as const;

export type AmenityKey = (typeof AMENITIES)[number]["key"];
