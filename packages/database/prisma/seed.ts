/**
 * Database seed.
 *
 * Creates the initial administrator from environment variables and, only when
 * SEED_SAMPLE_DATA=true, a small set of ILLUSTRATIVE development properties.
 * Sample rows are prefixed with "[AMOSTRA]" and are NOT real listings — they
 * exist solely to exercise the UI/data layer in development.
 *
 * Never run this against production with SEED_SAMPLE_DATA=true.
 */
import { PropertyStatus, TransactionType, PropertyType, Currency, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getPrisma } from "../src/index";

function toMinor(amountMajor: number): bigint {
  return BigInt(Math.round(amountMajor * 100));
}

const SAMPLE_MEDIA: Record<string, { url: string; alt: string }[]> = {
  "RGS-000001": [
    { url: "/photos/prop-1.jpg", alt: "Moradia T4 com piscina — Talatona" },
    { url: "/photos/interior.jpg", alt: "Interior da moradia em Talatona" },
  ],
  "RGS-000002": [
    { url: "/photos/prop-2.jpg", alt: "Apartamento T3 mobilado — Miramar" },
    { url: "/photos/interior.jpg", alt: "Sala do apartamento em Miramar" },
  ],
  "RGS-000003": [
    { url: "/photos/prop-3.jpg", alt: "Apartamento T2 — Kilamba" },
    { url: "/photos/interior.jpg", alt: "Interior do apartamento no Kilamba" },
  ],
  "RGS-000004": [
    { url: "/photos/prop-4.jpg", alt: "Terreno em Viana" },
    { url: "/photos/city.jpg", alt: "Vista da zona em Viana" },
  ],
};

async function main() {
  const prisma = await getPrisma();
  const email = process.env.ADMIN_EMAIL ?? "admin@regis.local";
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: process.env.ADMIN_NAME ?? "Administrador Regis",
      role: Role.SUPER_ADMIN,
      passwordHash,
    },
  });
  console.log(`✔ Admin utilizador: ${admin.email}`);

  if (process.env.SEED_SAMPLE_DATA === "true") {
    const samples = [
      { ref: "RGS-000001", title: "Moradia T4 com piscina — Talatona (AMOSTRA)", type: PropertyType.VILLA, tx: TransactionType.SALE, price: 185_000_000, beds: 4, baths: 4, area: 420, muni: "Talatona", hood: "Bairro Jardim" },
      { ref: "RGS-000002", title: "Apartamento T3 mobilado — Miramar (AMOSTRA)", type: PropertyType.APARTMENT, tx: TransactionType.SALE, price: 95_000_000, beds: 3, baths: 2, area: 165, muni: "Luanda", hood: "Miramar" },
      { ref: "RGS-000003", title: "Apartamento T2 para arrendar — Kilamba (AMOSTRA)", type: PropertyType.APARTMENT, tx: TransactionType.RENT, price: 450_000, beds: 2, baths: 1, area: 92, muni: "Kilamba Kiaxi", hood: "Kilamba" },
      { ref: "RGS-000004", title: "Terreno 1.200 m² — Viana (AMOSTRA)", type: PropertyType.LAND, tx: TransactionType.SALE, price: 28_000_000, beds: null, baths: null, area: null, muni: "Viana", hood: "Zango" },
    ] as const;

    for (const s of samples) {
      const property = await prisma.property.upsert({
        where: { reference: s.ref },
        update: {},
        create: {
          reference: s.ref,
          slug: s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
          title: s.title,
          description:
            "[AMOSTRA] Registo de desenvolvimento para validar a interface. Não representa um imóvel real da Regis Properties.",
          transactionType: s.tx,
          propertyType: s.type,
          status: PropertyStatus.PUBLISHED,
          priceAmountMinor: toMinor(s.price),
          priceCurrency: Currency.AOA,
          province: "Luanda",
          municipality: s.muni,
          neighborhood: s.hood,
          bedrooms: s.beds,
          bathrooms: s.baths,
          areaM2: s.area,
          amenities: ["garage", "security"],
          featured: s.ref === "RGS-000001" || s.ref === "RGS-000002",
          publishedAt: new Date(),
        },
      });

      const existingMedia = await prisma.propertyMedia.count({
        where: { propertyId: property.id },
      });
      if (existingMedia === 0) {
        await prisma.propertyMedia.createMany({
          data: (SAMPLE_MEDIA[s.ref] ?? []).map((media, displayOrder) => ({
            propertyId: property.id,
            url: media.url,
            alt: media.alt,
            displayOrder,
          })),
        });
      }
    }
    console.log(`✔ ${samples.length} imóveis de amostra (AMOSTRA) inseridos.`);
  } else {
    console.log("ℹ SEED_SAMPLE_DATA != true — sem imóveis de amostra inseridos.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    const prisma = await getPrisma();
    await prisma.$disconnect();
  });
