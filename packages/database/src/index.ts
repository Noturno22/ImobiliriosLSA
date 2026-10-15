// Named re-exports (instead of `export *`) so bundlers do not emit extra
// runtime interop for the CommonJS Prisma client.
export { Prisma } from "@prisma/client";
export { PrismaClient } from "@prisma/client";

// Client factory (supports managed PostgreSQL and embedded PGlite).
export { getPrisma, isPgliteDatabase, resolvePgliteDir } from "./client";
