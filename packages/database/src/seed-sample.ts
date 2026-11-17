import { randomUUID } from "node:crypto";
import type { PGlite } from "@electric-sql/pglite";

/**
 * Illustrative development inventory inserted into the embedded PGlite database
 * the first time it is created. These are NOT real listings — every photo is a
 * bundled Unsplash License asset (see apps/web/public/photos/CREDITS.txt).
 *
 * Skipped when SEED_SAMPLE_DATA=false or when the Property table already has
 * rows. Never used against a managed PostgreSQL database.
 */
type Sample = {
  reference: string;
  slug: string;
  title: string;
  description: string;
  transactionType: "SALE" | "RENT";
  propertyType: "HOUSE" | "VILLA" | "APARTMENT" | "LAND" | "COMMERCIAL" | "OFFICE" | "WAREHOUSE";
  listingSource: "PROFESSIONAL" | "PRIVATE";
  priceMajor: number;
  province: string;
  municipality: string;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parkingSpaces: number | null;
  areaM2: number | null;
  lotAreaM2: number | null;
  amenities: string[];
  featured: boolean;
  images: string[];
};

const DESCRIPTION =
  "[AMOSTRA] Registo de desenvolvimento para validar a interface. Não representa um imóvel real da Regis Properties.";

const SAMPLES: Sample[] = [
  {
    reference: "RGS-000001",
    slug: "moradia-t4-condominio-fechado-talatona",
    title: "Moradia T4 — Condomínio Fechado",
    description: `${DESCRIPTION} Moradia independente com piscina, jardim e acabamentos premium num condomínio com segurança 24 horas.`,
    transactionType: "SALE",
    propertyType: "VILLA",
    listingSource: "PROFESSIONAL",
    priceMajor: 250_000_000,
    province: "Luanda",
    municipality: "Talatona",
    neighborhood: "Bairro Jardim",
    latitude: -8.9152,
    longitude: 13.1844,
    bedrooms: 4,
    bathrooms: 5,
    parkingSpaces: 3,
    areaM2: 450,
    lotAreaM2: 800,
    amenities: ["garage", "security", "pool", "garden"],
    featured: true,
    images: ["/photos/prop-1.jpg", "/photos/interior.jpg", "/photos/city.jpg"],
  },
  {
    reference: "RGS-000002",
    slug: "apartamento-t3-vista-branca-viana",
    title: "Apartamento T3 — Vista Branca",
    description: `${DESCRIPTION} Apartamento moderno com varanda ampla, cozinha equipada e vista desafogada.`,
    transactionType: "SALE",
    propertyType: "APARTMENT",
    listingSource: "PROFESSIONAL",
    priceMajor: 120_000_000,
    province: "Luanda",
    municipality: "Viana",
    neighborhood: "Vista Branca",
    latitude: -8.9042,
    longitude: 13.3721,
    bedrooms: 3,
    bathrooms: 3,
    parkingSpaces: 2,
    areaM2: 180,
    lotAreaM2: null,
    amenities: ["garage", "security", "gym"],
    featured: true,
    images: ["/photos/prop-2.jpg", "/photos/interior.jpg"],
  },
  {
    reference: "RGS-000003",
    slug: "moradia-t3-mobilada-ingombota",
    title: "Moradia T3 — Mobiliada",
    description: `${DESCRIPTION} Moradia mobilada pronta a habitar, em zona central com bons acessos.`,
    transactionType: "RENT",
    propertyType: "HOUSE",
    listingSource: "PRIVATE",
    priceMajor: 2_500_000,
    province: "Luanda",
    municipality: "Ingombota",
    neighborhood: "Maculusso",
    latitude: -8.8267,
    longitude: 13.2347,
    bedrooms: 3,
    bathrooms: 4,
    parkingSpaces: 2,
    areaM2: 300,
    lotAreaM2: 400,
    amenities: ["garage", "security", "furnished"],
    featured: true,
    images: ["/photos/prop-3.jpg", "/photos/city.jpg"],
  },
  {
    reference: "RGS-000004",
    slug: "moradia-t4-vista-mar-cacuaco",
    title: "Moradia T4 — Vista Mar",
    description: `${DESCRIPTION} Moradia de dois pisos com ampla vista para o mar e área de lazer.`,
    transactionType: "SALE",
    propertyType: "HOUSE",
    listingSource: "PROFESSIONAL",
    priceMajor: 320_000_000,
    province: "Luanda",
    municipality: "Cacuaco",
    neighborhood: "Zona Costeira",
    latitude: -8.7764,
    longitude: 13.3711,
    bedrooms: 4,
    bathrooms: 4,
    parkingSpaces: 4,
    areaM2: 420,
    lotAreaM2: 700,
    amenities: ["garage", "security", "garden"],
    featured: true,
    images: ["/photos/prop-4.jpg", "/photos/interior.jpg"],
  },
  {
    reference: "RGS-000005",
    slug: "moradia-t3-jardim-belas",
    title: "Moradia T3 — Jardim",
    description: `${DESCRIPTION} Moradia em condomínio com jardim privativo e acabamentos de qualidade.`,
    transactionType: "SALE",
    propertyType: "HOUSE",
    listingSource: "PRIVATE",
    priceMajor: 180_000_000,
    province: "Luanda",
    municipality: "Belas",
    neighborhood: "Morro Bento",
    latitude: -8.9333,
    longitude: 13.1667,
    bedrooms: 3,
    bathrooms: 3,
    parkingSpaces: 2,
    areaM2: 260,
    lotAreaM2: 500,
    amenities: ["garage", "security", "garden"],
    featured: true,
    images: ["/photos/prop-5.jpg", "/photos/city.jpg"],
  },
  {
    reference: "RGS-000006",
    slug: "apartamento-t2-arrendar-kilamba",
    title: "Apartamento T2 — Arrendar",
    description: `${DESCRIPTION} Apartamento funcional e bem localizado, ideal para primeira habitação.`,
    transactionType: "RENT",
    propertyType: "APARTMENT",
    listingSource: "PROFESSIONAL",
    priceMajor: 450_000,
    province: "Luanda",
    municipality: "Kilamba Kiaxi",
    neighborhood: "Kilamba",
    latitude: -8.9958,
    longitude: 13.2694,
    bedrooms: 2,
    bathrooms: 1,
    parkingSpaces: 1,
    areaM2: 92,
    lotAreaM2: null,
    amenities: ["security"],
    featured: true,
    images: ["/photos/interior.jpg", "/photos/prop-1.jpg"],
  },
];

function toMinor(major: number): bigint {
  return BigInt(Math.round(major * 100));
}

export async function seedPgliteSampleData(client: PGlite): Promise<void> {
  const existing = await client.query<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM "Property"`,
  );
  if ((existing.rows[0]?.n ?? 0) > 0) return;

  const publishAt = new Date();

  for (const s of SAMPLES) {
    const propertyId = randomUUID();
    await client.query(
      `INSERT INTO "Property" (
         "id", "reference", "slug", "title", "description",
         "transactionType", "propertyType", "listingSource", "status",
         "priceAmountMinor", "priceCurrency",
         "province", "municipality", "neighborhood",
         "latitude", "longitude", "bedrooms", "bathrooms", "parkingSpaces",
         "areaM2", "lotAreaM2", "amenities", "featured",
         "publishedAt", "createdAt", "updatedAt"
       ) VALUES (
         $1,$2,$3,$4,$5,$6,$7,$8,'PUBLISHED',$9,'AOA',
         $10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$22,$22
       )`,
      [
        propertyId,
        s.reference,
        s.slug,
        s.title,
        s.description,
        s.transactionType,
        s.propertyType,
        s.listingSource,
        toMinor(s.priceMajor),
        s.province,
        s.municipality,
        s.neighborhood,
        s.latitude,
        s.longitude,
        s.bedrooms,
        s.bathrooms,
        s.parkingSpaces,
        s.areaM2,
        s.lotAreaM2,
        s.amenities,
        s.featured,
        publishAt,
      ],
    );

    let order = 0;
    for (const url of s.images) {
      await client.query(
        `INSERT INTO "PropertyMedia" (
           "id", "propertyId", "url", "type", "alt", "displayOrder", "createdAt"
         ) VALUES ($1,$2,$3,'IMAGE',$4,$5,$6)`,
        [randomUUID(), propertyId, url, s.title, order, publishAt],
      );
      order += 1;
    }
  }
}
