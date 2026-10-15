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
  __serrotePrisma?: Promise<PrismaClient>;
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
  const rel = url.replace(/^pglite:\/\/?/, "").replace(/^\/+/, "") || ".data/serrote";
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
  }

  // The adapter ships its own copy of the driver-adapter-utils types; the
  // interfaces are structurally identical but not nominally assignable, so we
  // align it with the client's expected adapter type.
  type PrismaAdapter = NonNullable<ConstructorParameters<typeof PrismaClient>[0]>["adapter"];
  const adapter = new PrismaPGlite(client) as unknown as PrismaAdapter;
  return new PrismaClient({ adapter, log: prismaLog() });
}

function createPrisma(): Promise<PrismaClient> {
  if (isPgliteDatabase()) return createPglitePrisma();
  return Promise.resolve(new PrismaClient({ log: prismaLog() }));
}

/** Returns a ready-to-use PrismaClient, initialising PGlite on first call. */
export function getPrisma(): Promise<PrismaClient> {
  if (!globalForPrisma.__serrotePrisma) {
    globalForPrisma.__serrotePrisma = createPrisma();
  }
  return globalForPrisma.__serrotePrisma;
}
