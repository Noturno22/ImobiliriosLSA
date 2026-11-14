// Regenerates src/pglite-ddl.ts (the schema DDL embedded for the embedded
// PGlite database) from prisma/schema.prisma.
//
//   pnpm --filter @regis/database db:pglite:ddl
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const sql = execSync(
  "prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script",
  { cwd: pkgRoot, encoding: "utf8" },
);

const header =
  "// AUTO-GENERATED from prisma/schema.prisma via `prisma migrate diff`.\n" +
  "// Regenerate: pnpm --filter @regis/database db:pglite:ddl\n" +
  "// Applied automatically when a pglite:// database is created for local dev.\n\n";

writeFileSync(
  join(pkgRoot, "src", "pglite-ddl.ts"),
  `${header}export const PGLITE_DDL = \`${sql}\`;\n`,
  "utf8",
);

console.log("✔ src/pglite-ddl.ts regenerado a partir do schema.");
