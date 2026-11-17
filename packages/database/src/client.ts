import { existsSync, mkdirSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { PGLITE_DDL } from "./pglite-ddl";

/**
 * Prisma client factory.
 *
 * - `postgresql://…`  → a normal PrismaClient (production/staging PostgreSQL).
 * - `pglite://…`      → embedded PostgreSQL (PGlite). The database directory
 *                       is created on first run, the schema is applied from the
 *                       generated DDL and, unless SEED_SAMPLE_DATA=false,
 *                       illustrative sample inventory is inserted.
 *
 * Local development only; PGlite is a single-process embedded database and must
 * not be used in production.
 */
const globalForPrisma = globalThis as unknown as {
  __regisPrisma?: Promise<PrismaClient>;
};

function prismaLog(): ("warn" | "error")[] {
  return process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"];
}

export function isPgliteDatabase(): boolean {
  return (process.env.DATABASE_URL ?? "").trim().startsWith("pglite:");
}

function findRepoRoot(start: string): string {
  let dir = start;
  for (let i = 0; i < 8; i += 1) {
    if (existsSync(join(dir, "pnpm-workspace.yaml"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return start;
}

/** Absolute path of the PGlite data directory (stable regardless of cwd). */
export function resolvePgliteDir(): string {
  const root = findRepoRoot(process.cwd());

  const fromEnv = process.env.PGLITE_DIR?.trim();
  if (fromEnv) return isAbsolute(fromEnv) ? fromEnv : resolve(root, fromEnv);

  const url = (process.env.DATABASE_URL ?? "").trim();
  const rel = url.replace(/^pglite:\/\/?/, "").replace(/^\/+/, "") || ".data/regis";
  return resolve(root, rel);
}

async function createPglitePrisma(): Promise<PrismaClient> {
  const [{ PGlite }, { PrismaPGlite }] = await Promise.all([
    import("@electric-sql/pglite"),
    import("pglite-prisma-adapter"),
  ]);

  const dir = resolvePgliteDir();
  mkdirSync(dir, { recursive: true });
  const client = await PGlite.create(dir);

  const schema = await client.query<{ present: boolean }>(
    `SELECT to_regclass('"public"."Property"') IS NOT NULL AS present`,
  );

  if (!schema.rows[0]?.present) {
    await client.exec(PGLITE_DDL);
    if (process.env.SEED_SAMPLE_DATA !== "false") {
      const { seedPgliteSampleData } = await import("./seed-sample");
      await seedPgliteSampleData(client);
    }
  } else {
    // Existing PGlite databases only received the original DDL on first
    // creation — apply additive upgrades (new columns/tables) in place.
    await upgradePgliteSchema(client);
  }

  // Provision the initial administrator (no-op without ADMIN_EMAIL/ADMIN_PASSWORD).
  const { ensurePgliteAdminUser } = await import("./admin-bootstrap");
  await ensurePgliteAdminUser(client);

  // The adapter ships its own copy of the driver-adapter-utils types; the
  // interfaces are structurally identical but not nominally assignable, so we
  // align it with the client's expected adapter type.
  type PrismaAdapter = NonNullable<ConstructorParameters<typeof PrismaClient>[0]>["adapter"];
  const adapter = new PrismaPGlite(client) as unknown as PrismaAdapter;
  return new PrismaClient({ adapter, log: prismaLog() });
}

/**
 * Idempotent upgrades for PGlite databases created before the current schema.
 * Mirrors prisma/migrations/20261117120000_listing_source_video_tables.
 */
async function upgradePgliteSchema(client: {
  exec: (sql: string) => Promise<unknown>;
  query: <T>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}): Promise<void> {
  const col = await client.query<{ present: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_name = 'Property' AND column_name = 'listingSource'
     ) AS present`,
  );
  const hasListingSource = col.rows[0]?.present === true;

  const videoLike = await client.query<{ present: boolean }>(
    `SELECT to_regclass('"public"."VideoLike"') IS NOT NULL AS present`,
  );
  const hasVideoLike = videoLike.rows[0]?.present === true;

  if (hasListingSource && hasVideoLike) return;

  const statements: string[] = [];
  if (!hasListingSource) {
    statements.push(
      `DO $$ BEGIN
         IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ListingSource') THEN
           CREATE TYPE "ListingSource" AS ENUM ('PROFESSIONAL', 'PRIVATE');
         END IF;
       END $$;`,
      `ALTER TABLE "Property"
         ADD COLUMN IF NOT EXISTS "listingSource" "ListingSource" NOT NULL DEFAULT 'PROFESSIONAL';`,
      `CREATE INDEX IF NOT EXISTS "Property_listingSource_idx" ON "Property" ("listingSource");`,
    );
  }
  if (!hasVideoLike) {
    statements.push(
      `CREATE TABLE IF NOT EXISTS "VideoLike" (
         "id" TEXT NOT NULL,
         "videoId" TEXT NOT NULL,
         "anonId" TEXT NOT NULL,
         "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
         CONSTRAINT "VideoLike_pkey" PRIMARY KEY ("id")
       );`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "VideoLike_videoId_anonId_key" ON "VideoLike" ("videoId", "anonId");`,
      `CREATE INDEX IF NOT EXISTS "VideoLike_videoId_idx" ON "VideoLike" ("videoId");`,
      `CREATE TABLE IF NOT EXISTS "VideoComment" (
         "id" TEXT NOT NULL,
         "videoId" TEXT NOT NULL,
         "author" TEXT NOT NULL,
         "content" TEXT NOT NULL,
         "anonId" TEXT,
         "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
         "updatedAt" TIMESTAMP(3) NOT NULL,
         CONSTRAINT "VideoComment_pkey" PRIMARY KEY ("id")
       );`,
      `CREATE INDEX IF NOT EXISTS "VideoComment_videoId_createdAt_idx" ON "VideoComment" ("videoId", "createdAt");`,
    );
  }

  for (const sql of statements) {
    await client.exec(sql);
  }
}

function createPrisma(): Promise<PrismaClient> {
  if (isPgliteDatabase()) return createPglitePrisma();
  return Promise.resolve(new PrismaClient({ log: prismaLog() }));
}

/** Returns a ready-to-use PrismaClient, initialising PGlite on first call. */
export function getPrisma(): Promise<PrismaClient> {
  if (!globalForPrisma.__regisPrisma) {
    globalForPrisma.__regisPrisma = createPrisma();
  }
  return globalForPrisma.__regisPrisma;
}
