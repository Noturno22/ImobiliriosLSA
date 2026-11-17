/**
 * Video reel data layer.
 *
 * Sources (in order):
 *  1. PropertyMedia rows with type = VIDEO (admin-managed property tours).
 *  2. Editorial videos from lib/content.ts (YouTube Shorts, secondary).
 *
 * Every reel gets a stable `id` used for likes/comments:
 *  - property videos → `prop_<mediaId>`
 *  - editorial       → `ed_<videoItemId>`
 */

import { formatMoney } from "@regis/domain";

export type VideoSourceKind = "property" | "editorial";

export type ParsedVideo =
  | { kind: "youtube"; id: string }
  | { kind: "tiktok"; url: string }
  | { kind: "direct"; url: string };

export interface VideoReel {
  id: string;
  source: VideoSourceKind;
  /** YouTube id, direct URL or TikTok URL — consumed by the player. */
  playback: ParsedVideo;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  /** Property link when the reel is tied to a listing. */
  propertySlug?: string | null;
  propertyTitle?: string | null;
  propertyLocation?: string | null;
  propertyPriceLabel?: string | null;
  propertyRef?: string | null;
  order: number;
}

export interface VideoLikeState {
  count: number;
  liked: boolean;
}

export interface VideoComment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

/** Extracts a YouTube video id from common URL shapes (watch, shorts, embed, youtu.be). */
export function parseYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([A-Za-z0-9_-]{6,})/i,
    /(?:youtube\.com\/shorts\/)([A-Za-z0-9_-]{6,})/i,
    /(?:youtube\.com\/embed\/)([A-Za-z0-9_-]{6,})/i,
    /(?:youtu\.be\/)([A-Za-z0-9_-]{6,})/i,
  ];
  for (const re of patterns) {
    const m = re.exec(url);
    if (m?.[1]) return m[1];
  }
  return null;
}

/** Classifies a media URL as YouTube, TikTok or a direct video file. */
export function parseVideoUrl(url: string): ParsedVideo | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const yt = parseYouTubeId(trimmed);
  if (yt) return { kind: "youtube", id: yt };

  if (/tiktok\.com\//i.test(trimmed)) return { kind: "tiktok", url: trimmed };

  if (/\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(trimmed)) {
    return { kind: "direct", url: trimmed };
  }

  // Bare YouTube id pasted as a URL alternative
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) {
    return { kind: "youtube", id: trimmed };
  }

  return null;
}

function databaseConfigured(): boolean {
  if (process.env.NEXT_PHASE === "phase-production-build") return false;
  return !!process.env.DATABASE_URL?.trim();
}

/** Thumbnail for a parsed video (YouTube still; null for others). */
function thumbnailFor(playback: ParsedVideo): string | null {
  if (playback.kind === "youtube") {
    return `https://i.ytimg.com/vi/${playback.id}/hqdefault.jpg`;
  }
  return null;
}

/**
 * Loads all public video reels: property videos first (published listings),
 * then active editorial videos.
 */
export async function getVideoReels(): Promise<VideoReel[]> {
  const reels: VideoReel[] = [];

  // 1) Property videos
  if (databaseConfigured()) {
    try {
      const { getPrisma } = await import("@regis/database");
      const prisma = await getPrisma();
      const rows = await prisma.propertyMedia.findMany({
        where: {
          type: "VIDEO",
          property: { status: { in: ["PUBLISHED", "RESERVED"] } },
        },
        orderBy: [{ property: { publishedAt: "desc" as const } }, { displayOrder: "asc" as const }],
        include: {
          property: {
            select: {
              slug: true,
              title: true,
              province: true,
              municipality: true,
              neighborhood: true,
              priceAmountMinor: true,
              priceCurrency: true,
              reference: true,
              transactionType: true,
            },
          },
        },
      });

      for (const row of rows) {
        const playback = parseVideoUrl(row.url);
        if (!playback) continue;
        const p = row.property;
        const location = [p.neighborhood, p.municipality, p.province]
          .filter(Boolean)
          .join(", ");
        reels.push({
          id: `prop_${row.id}`,
          source: "property",
          playback,
          title: row.caption || p.title,
          description: row.alt || null,
          thumbnailUrl: thumbnailFor(playback),
          propertySlug: p.slug,
          propertyTitle: p.title,
          propertyLocation: location || null,
          propertyPriceLabel: formatPrice(
            Number(p.priceAmountMinor),
            p.priceCurrency,
            p.transactionType,
          ),
          propertyRef: p.reference,
          order: reels.length,
        });
      }
    } catch (error) {
      console.error("[videos] failed to load property videos:", error);
    }
  }

  // 2) Editorial videos from content.ts
  try {
    const { getHomeContent } = await import("./content");
    const content = await getHomeContent();
    for (const v of content.videos) {
      if (!v.active) continue;
      const playback: ParsedVideo = { kind: "youtube", id: v.youtubeId };
      reels.push({
        id: `ed_${v.id}`,
        source: "editorial",
        playback,
        title: v.title,
        description: v.description ?? null,
        thumbnailUrl: thumbnailFor(playback),
        order: reels.length,
      });
    }
  } catch (error) {
    console.error("[videos] failed to load editorial videos:", error);
  }

  return reels;
}

function formatPrice(
  amountMinor: number,
  currency: string,
  transactionType: string,
): string {
  try {
    const label = formatMoney({
      amountMinor,
      currency: currency as "AOA" | "USD" | "EUR",
    });
    return transactionType === "RENT" ? `${label}/mês` : label;
  } catch {
    return "";
  }
}

/** Like state for a set of video ids for one anonymous visitor. */
export async function getLikeStates(
  videoIds: string[],
  anonId: string,
): Promise<Record<string, VideoLikeState>> {
  const states: Record<string, VideoLikeState> = {};
  for (const id of videoIds) states[id] = { count: 0, liked: false };
  if (!databaseConfigured() || videoIds.length === 0 || !anonId) return states;

  try {
    const { getPrisma } = await import("@regis/database");
    const prisma = await getPrisma();
    const [counts, mine] = await Promise.all([
      prisma.videoLike.groupBy({
        by: ["videoId"],
        where: { videoId: { in: videoIds } },
        _count: { _all: true },
      }),
      prisma.videoLike.findMany({
        where: { videoId: { in: videoIds }, anonId },
        select: { videoId: true },
      }),
    ]);
    const likedSet = new Set(mine.map((m) => m.videoId));
    for (const c of counts) {
      states[c.videoId] = { count: c._count._all, liked: likedSet.has(c.videoId) };
    }
    // Ensure liked but zero-count edge is reflected (shouldn't happen).
    for (const id of likedSet) {
      if (states[id]) states[id].liked = true;
    }
  } catch (error) {
    console.error("[videos] failed to load like states:", error);
  }
  return states;
}

/** Comment counts for video ids. */
export async function getCommentCounts(
  videoIds: string[],
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const id of videoIds) counts[id] = 0;
  if (!databaseConfigured() || videoIds.length === 0) return counts;

  try {
    const { getPrisma } = await import("@regis/database");
    const prisma = await getPrisma();
    const rows = await prisma.videoComment.groupBy({
      by: ["videoId"],
      where: { videoId: { in: videoIds } },
      _count: { _all: true },
    });
    for (const r of rows) counts[r.videoId] = r._count._all;
  } catch (error) {
    console.error("[videos] failed to load comment counts:", error);
  }
  return counts;
}

/** Lists comments for a video, newest first. */
export async function getVideoComments(videoId: string): Promise<VideoComment[]> {
  if (!databaseConfigured()) return [];
  try {
    const { getPrisma } = await import("@regis/database");
    const prisma = await getPrisma();
    const rows = await prisma.videoComment.findMany({
      where: { videoId },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, author: true, content: true, createdAt: true },
    });
    return rows.map((r) => ({
      id: r.id,
      author: r.author,
      content: r.content,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("[videos] failed to load comments:", error);
    return [];
  }
}
