import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VideoReels } from "@/components/video-reels";
import { getVideoReels, getLikeStates, getCommentCounts } from "@/lib/videos";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vídeos",
  description:
    "Tours de imóveis em vídeo. Deslize para ver casas, apartamentos e villas em Angola.",
};

export default async function VideosPage() {
  const reels = await getVideoReels();
  const ids = reels.map((r) => r.id);

  // Server-side initial counts (anonId empty → liked=false everywhere;
  // the client refetches personalised state on mount if needed).
  const [likes, commentCounts] = await Promise.all([
    getLikeStates(ids, ""),
    getCommentCounts(ids),
  ]);

  const initial = reels.map((reel) => ({
    ...reel,
    likes: likes[reel.id] ?? { count: 0, liked: false },
    commentCount: commentCounts[reel.id] ?? 0,
  }));

  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.26em] text-accent">Vídeos</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-navy dark:text-ink sm:text-4xl">
          Imóveis <span className="text-accent">em vídeo</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm text-ink-muted">
          Deslize para cima ou para baixo, use as setas do teclado, curta e comente. Contacte
          directamente a partir do vídeo.
        </p>

        <div className="mt-6">
          <VideoReels initialReels={initial} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
