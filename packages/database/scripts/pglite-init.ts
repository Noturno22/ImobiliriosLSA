/**
 * Initialises the embedded PGlite database for local development:
 * creates the data directory, applies the schema and seeds sample inventory.
 *
 *   pnpm --filter @serrote/database db:pglite:init
 */
import { getPrisma, isPgliteDatabase, resolvePgliteDir } from "../src/index";

async function main() {
  if (!isPgliteDatabase()) {
    console.log("DATABASE_URL não é um endereço pglite:// — nada a inicializar.");
    return;
  }

  console.log(`PGlite data directory: ${resolvePgliteDir()}`);
  const prisma = await getPrisma();
  const [properties, media] = await Promise.all([
    prisma.property.count(),
    prisma.propertyMedia.count(),
  ]);
  console.log(`✔ PGlite pronta — ${properties} imóveis, ${media} ficheiros de média.`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
