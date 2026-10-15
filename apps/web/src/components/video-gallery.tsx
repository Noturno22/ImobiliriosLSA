"use client";

import { useState } from "react";
import type { VideoItem } from "@/lib/content";

/**
 * Video gallery. Thumbnails are rendered as a lightweight facade and the
 * (privacy-friendly) YouTube player is only mounted once the visitor presses
 * play, keeping the page fast until then.
 */
export function VideoGallery({
  videos,
  channelUrl,
}: {
  videos: VideoItem[];
  channelUrl: string | null;
}) {
  const [playingId, setPlayingId] = useState<string | null>(null);

  return (
    <section aria-labelledby="videos" className="border-y border-line bg-canvas-soft">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <header className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange">Vídeos</p>
          <h2
            id="videos"
            className="mt-3 font-display text-2xl font-extrabold tracking-tight text-navy sm:text-3xl"
          >
            Veja os imóveis <span className="text-orange">em vídeo</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base">
            Tours, dicas e apresentações em vídeo para conhecer cada detalhe antes da visita.
          </p>
        </header>

        {videos.length === 0 ? (
          <div className="mt-8 rounded-card border border-dashed border-line-strong bg-canvas p-8 text-center">
            <p className="font-display text-lg font-bold text-navy">Vídeos a caminho</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
              Estamos a preparar os primeiros vídeos.
              {channelUrl ? " Subscreva o nosso canal para não perder nada." : " Volte em breve."}
            </p>
            {channelUrl && (
              <a
                href={channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex h-11 items-center rounded-full bg-orange px-6 text-sm font-semibold text-white transition-colors hover:bg-orange-hover"
              >
                Visitar o canal
              </a>
            )}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                playing={playingId === video.id}
                onPlay={() => setPlayingId(video.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function VideoCard({
  video,
  playing,
  onPlay,
}: {
  video: VideoItem;
  playing: boolean;
  onPlay: () => void;
}) {
  const vertical = video.orientation === "vertical";

  return (
    <article className="overflow-hidden rounded-card border border-line bg-canvas shadow-card">
      <div className={`relative bg-navy-deep ${vertical ? "aspect-[9/16]" : "aspect-video"}`}>
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 size-full"
          />
        ) : (
          <button
            type="button"
            onClick={onPlay}
            aria-label={`Reproduzir: ${video.title}`}
            className="group absolute inset-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
            <span aria-hidden className="absolute inset-0 grid place-items-center">
              <span className="grid size-14 place-items-center rounded-full bg-orange text-white shadow-elevated transition-transform duration-200 group-hover:scale-110">
                <svg viewBox="0 0 24 24" className="size-6 translate-x-[2px]" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
            {video.durationLabel && (
              <span className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-xs font-semibold text-white">
                {video.durationLabel}
              </span>
            )}
          </button>
        )}
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 font-display text-base font-bold leading-snug text-navy dark:text-ink">
          {video.title}
        </h3>
        {video.description && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-muted">
            {video.description}
          </p>
        )}
      </div>
    </article>
  );
}
