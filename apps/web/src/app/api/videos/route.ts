import { NextResponse } from "next/server";
import { getVideoReels, getLikeStates, getCommentCounts } from "@/lib/videos";

export const dynamic = "force-dynamic";

/**
 * GET /api/videos — public feed of video reels with like/comment counts.
 * Optional `anonId` query param personalises the `liked` flag.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const anonId = searchParams.get("anonId")?.trim() || "";

  const reels = await getVideoReels();
  const ids = reels.map((r) => r.id);

  const [likes, commentCounts] = await Promise.all([
    getLikeStates(ids, anonId),
    getCommentCounts(ids),
  ]);

  return NextResponse.json({
    items: reels.map((reel) => ({
      ...reel,
      likes: likes[reel.id] ?? { count: 0, liked: false },
      commentCount: commentCounts[reel.id] ?? 0,
    })),
  });
}
