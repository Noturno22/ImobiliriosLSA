import { randomUUID } from "node:crypto";
import type { PGlite } from "@electric-sql/pglite";

/**
 * Idempotently provisions the initial administrator in the embedded PGlite
 * database from ADMIN_EMAIL / ADMIN_PASSWORD.
 *
 * - No-op when either variable is missing — we never invent credentials.
 * - No-op when an account with that email already exists (the stored hash is
 *   left untouched; change the password through an explicit seed/migration).
 *
 * Local development only (the caller is the PGlite initialiser).
 */
export async function ensurePgliteAdminUser(client: PGlite): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  const existing = await client.query<{ present: number }>(
    `SELECT 1 AS present FROM "User" WHERE "email" = $1 LIMIT 1`,
    [email],
  );
  if (existing.rows.length > 0) return;

  const { default: bcrypt } = await import("bcryptjs");
  const name = process.env.ADMIN_NAME?.trim() || "Administrador Regis";
  const passwordHash = await bcrypt.hash(password, 10);

  await client.query(
    `INSERT INTO "User" ("id","name","email","passwordHash","role","active","createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,'SUPER_ADMIN',true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`,
    [randomUUID(), name, email, passwordHash],
  );
}
