import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

/** Local filesystem storage for admin uploads (dev / self-hosted). */
const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

const MAX_FILE_BYTES = 5 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
};

export interface UploadResult {
  /** Public URLs (served from /public/uploads). */
  urls: string[];
  /** Number of rejected files (wrong type or too large). */
  skipped: number;
}

/**
 * Persists uploaded images under `public/uploads` and returns their URLs.
 * Unsupported or oversized files are skipped rather than failing the whole
 * submission, so a bad file never blocks a property save.
 *
 * NOTE: files written at runtime are served in dev. For production, swap this
 * for object storage (S3/R2/Supabase) and keep the same return shape.
 */
export async function saveUploadedImages(files: File[]): Promise<UploadResult> {
  const urls: string[] = [];
  let skipped = 0;

  const candidates = files.filter((file) => file && file.size > 0);
  if (candidates.length === 0) return { urls, skipped };

  await mkdir(UPLOAD_DIR, { recursive: true });

  for (const file of candidates) {
    const extension = ALLOWED_TYPES[file.type];
    if (!extension || file.size > MAX_FILE_BYTES) {
      skipped += 1;
      continue;
    }

    const name = `${randomUUID()}${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(join(UPLOAD_DIR, name), buffer);
    urls.push(`/uploads/${name}`);
  }

  return { urls, skipped };
}
