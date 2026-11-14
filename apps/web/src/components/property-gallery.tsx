"use client";

import { useCallback, useEffect, useState } from "react";

export type GalleryImage = {
  id: string;
  url: string;
  alt: string;
  caption?: string | null;
};

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      {dir === "left" ? (
        <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

/**
 * Property media gallery: one large frame plus a keyboard-accessible thumbnail
 * strip. Falls back to a neutral placeholder when no media is available rather
 * than showing a broken image.
 */
export function PropertyGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [active, setActive] = useState(0);

  const count = images.length;
  const go = useCallback(
    (step: number) => {
      if (count === 0) return;
      setActive((prev) => (prev + step + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count <= 1) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, go]);

  if (count === 0) {
    return (
      <div className="grid aspect-[16/10] place-items-center rounded-card border border-line bg-gradient-to-br from-navy to-navy-deep text-gold">
        <span className="px-6 text-center text-sm font-medium tracking-wide">
          Fotografia do imóvel indisponível
        </span>
      </div>
    );
  }

  const current = images[Math.min(active, count - 1)] ?? images[0];
  if (!current) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-card border border-line bg-canvas-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={current.id}
          src={current.url}
          alt={current.alt || title}
          className="aspect-[16/10] w-full object-cover"
        />
        {current.caption && (
          <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/70 to-transparent px-4 pb-3 pt-8 text-xs text-white">
            {current.caption}
          </p>
        )}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Imagem anterior"
              className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-line/40 bg-canvas/50 text-ink backdrop-blur transition-colors hover:bg-canvas/80"
            >
              <Chevron dir="left" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Imagem seguinte"
              className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-line/40 bg-canvas/50 text-ink backdrop-blur transition-colors hover:bg-canvas/80"
            >
              <Chevron dir="right" />
            </button>
            <p className="absolute right-3 top-3 rounded-pill bg-navy/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              {active + 1} / {count}
            </p>
          </>
        )}
      </div>

      {count > 1 && (
        <ul className="flex gap-2 overflow-x-auto pb-1" aria-label="Miniaturas do imóvel">
          {images.map((image, index) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Ver imagem ${index + 1} de ${count}`}
                aria-current={index === active ? "true" : undefined}
                className={`block size-20 shrink-0 overflow-hidden rounded-control border-2 transition-colors ${
                  index === active ? "border-accent" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt="" className="size-full object-cover" loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
