import { NextResponse } from "next/server";
import { parseVideoLike } from "@regis/validation";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/videos/[id]/like?anonId=… — current count + liked flag.
 * POST /api/videos/[id]/like — toggle like for an anonymous visitor.
 */
export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const anonId = searchParams.get("anonId")?.trim() || "";

  if (!databaseReady()) {
    return NextResponse.json({ count: 0, liked: false });
  }

  try {
    const { getPrisma } = await import("@regis/database");
    const prisma = await getPrisma();
    const [count, mine] = await Promise.all([
      prisma.videoLike.count({ where: { videoId: id } }),
      anonId
        ? prisma.videoLike.findUnique({
            where: { videoId_anonId: { videoId: id, anonId } },
            select: { id: true },
          })
        : Promise.resolve(null),
    ]);
    return NextResponse.json({ count, liked: !!mine });
  } catch (error) {
    console.error("[api/videos/like] GET failed:", error);
    return NextResponse.json({ count: 0, liked: false });
  }
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const parsed = parseVideoLike({ ...(body as object), videoId: id });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  if (!databaseReady()) {
    return NextResponse.json({ error: "Base de dados indisponível." }, { status: 503 });
  }

  try {
    const { getPrisma } = await import("@regis/database");
    const prisma = await getPrisma();
    const { videoId, anonId } = parsed.data;

    const existing = await prisma.videoLike.findUnique({
      where: { videoId_anonId: { videoId, anonId } },
      select: { id: true },
    });

    if (existing) {
      await prisma.videoLike.delete({ where: { id: existing.id } });
    } else {
      await prisma.videoLike.create({ data: { videoId, anonId } });
    }

    const count = await prisma.videoLike.count({ where: { videoId } });
    return NextResponse.json({ count, liked: !existing });
  } catch (error) {
    console.error("[api/videos/like] POST failed:", error);
    return NextResponse.json({ error: "Não foi possível registar o like." }, { status: 500 });
  }
}

function databaseReady(): boolean {
  if (process.env.NEXT_PHASE === "phase-production-build") return false;
  return !!process.env.DATABASE_URL?.trim();
}
