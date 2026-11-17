/** Domain enums shared by web, API, database and mobile. */

export const TransactionType = {
  SALE: "SALE",
  RENT: "RENT",
} as const;
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

export const PropertyType = {
  HOUSE: "HOUSE",
  VILLA: "VILLA",
  APARTMENT: "APARTMENT",
  LAND: "LAND",
  COMMERCIAL: "COMMERCIAL",
  OFFICE: "OFFICE",
  WAREHOUSE: "WAREHOUSE",
} as const;
export type PropertyType = (typeof PropertyType)[keyof typeof PropertyType];

export const PropertyStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  RESERVED: "RESERVED",
  SOLD: "SOLD",
  RENTED: "RENTED",
  ARCHIVED: "ARCHIVED",
} as const;
export type PropertyStatus = (typeof PropertyStatus)[keyof typeof PropertyStatus];

/** Statuses that may be shown publicly. Enforced server-side. */
export const PUBLIC_PROPERTY_STATUSES: readonly PropertyStatus[] = [
  PropertyStatus.PUBLISHED,
  PropertyStatus.RESERVED,
];

export const ListingSource = {
  PROFESSIONAL: "PROFESSIONAL",
  PRIVATE: "PRIVATE",
} as const;
export type ListingSource = (typeof ListingSource)[keyof typeof ListingSource];

export const MediaType = {
  IMAGE: "IMAGE",
  VIDEO: "VIDEO",
  PANORAMA: "PANORAMA",
  FLOORPLAN: "FLOORPLAN",
  MODEL_3D: "MODEL_3D",
} as const;
export type MediaType = (typeof MediaType)[keyof typeof MediaType];

export const LeadSource = {
  WEBSITE: "WEBSITE",
  MOBILE_APP: "MOBILE_APP",
  WHATSAPP: "WHATSAPP",
  PHONE: "PHONE",
  EMAIL: "EMAIL",
  WALK_IN: "WALK_IN",
} as const;
export type LeadSource = (typeof LeadSource)[keyof typeof LeadSource];

export const LeadStatus = {
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  QUALIFIED: "QUALIFIED",
  VISIT_SCHEDULED: "VISIT_SCHEDULED",
  WON: "WON",
  LOST: "LOST",
} as const;
export type LeadStatus = (typeof LeadStatus)[keyof typeof LeadStatus];

export const RequestType = {
  GENERAL: "GENERAL",
  PROPERTY_INFO: "PROPERTY_INFO",
  VIEWING: "VIEWING",
  CALLBACK: "CALLBACK",
  VALUATION: "VALUATION",
} as const;
export type RequestType = (typeof RequestType)[keyof typeof RequestType];

export const AppointmentStatus = {
  REQUESTED: "REQUESTED",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  NO_SHOW: "NO_SHOW",
} as const;
export type AppointmentStatus = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

export const Currency = {
  AOA: "AOA",
  USD: "USD",
  EUR: "EUR",
} as const;
export type Currency = (typeof Currency)[keyof typeof Currency];

export const PropertySort = {
  RECENT: "RECENT",
  PRICE_ASC: "PRICE_ASC",
  PRICE_DESC: "PRICE_DESC",
  AREA_DESC: "AREA_DESC",
  FEATURED: "FEATURED",
} as const;
export type PropertySort = (typeof PropertySort)[keyof typeof PropertySort];
