import { z } from "zod";

/** Toggle a like on a video. Requires a stable anonymous id. */
export const videoLikeSchema = z.object({
  videoId: z.string().trim().min(1).max(120),
  anonId: z
    .string()
    .trim()
    .min(8)
    .max(64)
    .regex(/^[A-Za-z0-9_-]+$/, "Identificador inválido."),
});

export type VideoLikeInput = z.infer<typeof videoLikeSchema>;

/** Create a comment on a video. */
export const videoCommentCreateSchema = z.object({
  videoId: z.string().trim().min(1).max(120),
  author: z
    .string()
    .trim()
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(60, "O nome é demasiado longo."),
  content: z
    .string()
    .trim()
    .min(2, "O comentário é demasiado curto.")
    .max(800, "O comentário é demasiado longo."),
  anonId: z
    .string()
    .trim()
    .min(8)
    .max(64)
    .regex(/^[A-Za-z0-9_-]+$/)
    .optional(),
});

export type VideoCommentCreateInput = z.infer<typeof videoCommentCreateSchema>;

/** Basic spam heuristic: too many links or repeated characters. */
export function looksLikeSpam(content: string): boolean {
  const links = (content.match(/https?:\/\//gi) ?? []).length;
  if (links > 2) return true;
  if (/(.)\1{9,}/.test(content)) return true;
  return false;
}

export function parseVideoCommentCreate(input: unknown) {
  return videoCommentCreateSchema.safeParse(input);
}

export function parseVideoLike(input: unknown) {
  return videoLikeSchema.safeParse(input);
}
