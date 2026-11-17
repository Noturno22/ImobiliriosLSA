import { NextResponse } from "next/server";
import { looksLikeSpam, parseVideoCommentCreate } from "@regis/validation";
import { getVideoComments } from "@/lib/videos";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** Very small in-memory rate limit: max 5 posts per anonId per minute. */
const postLog = new Map<string, number[]>();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5;

function rateLimited(anonId: string): boolean {
  const now = Date.now();
  const hits = (postLog.get(anonId) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) {
    postLog.set(anonId, hits);
    return true;
  }
  hits.push(now);
  postLog.set(anonId, hits);
  return false;
}

function databaseReady(): boolean {
  if (process.env.NEXT_PHASE === "phase-production-build") return false;
  return !!process.env.DATABASE_URL?.trim();
}

/** GET /api/videos/[id]/comments — list comments for a video. */
export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const comments = await getVideoComments(id);
  return NextResponse.json({ items: comments });
}

/** POST /api/videos/[id]/comments — create a comment. */
export async function POST(request: Request, { params }: Params) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const parsed = parseVideoCommentCreate({ ...(body as object), videoId: id });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  const { videoId, author, content, anonId } = parsed.data;

  if (looksLikeSpam(content)) {
    return NextResponse.json(
      { error: "O comentário contém conteúdo não permitido." },
      { status: 400 },
    );
  }

  const rateKey = anonId ?? "anonymous";
  if (rateLimited(rateKey)) {
    return NextResponse.json(
      { error: "Demasiados comentários. Tente dentro de um minuto." },
      { status: 429 },
    );
  }

  if (!databaseReady()) {
    return NextResponse.json({ error: "Base de dados indisponível." }, { status: 503 });
  }

  try {
    const { getPrisma } = await import("@regis/database");
    const prisma = await getPrisma();
    const created = await prisma.videoComment.create({
      data: { videoId, author, content, anonId: anonId ?? null },
      select: { id: true, author: true, content: true, createdAt: true },
    });
    return NextResponse.json(
      {
        item: {
          id: created.id,
          author: created.author,
          content: created.content,
          createdAt: created.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[api/videos/comments] POST failed:", error);
    return NextResponse.json(
      { error: "Não foi possível publicar o comentário." },
      { status: 500 },
    );
  }
}
