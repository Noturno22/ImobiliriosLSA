"use client";

import { useEffect, useState } from "react";

export type HeroSlide = {
  /** First heading line, rendered in the default heading colour. */
  lead: string;
  /** Second heading line, rendered in the orange accent. */
  accent: string;
  /** Supporting copy — rendered as separate lines on wider screens. */
  lines: string[];
};

const INTERVAL_MS = 6500;
const FADE_MS = 500;

/**
 * Rotates the hero heading/subheading through a set of variants, cross-fading
 * between them on an interval. The first variant is rendered on the server, so
 * the initial HTML (and search engines) always see a stable, meaningful heading.
 * Rotation is skipped when the visitor prefers reduced motion.
 */
export function HeroHeadline({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (slides.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let swap: ReturnType<typeof setTimeout> | undefined;
    const id = setInterval(() => {
      setVisible(false);
      swap = setTimeout(() => {
        setIndex((current) => (current + 1) % slides.length);
        setVisible(true);
      }, FADE_MS);
    }, INTERVAL_MS);

    return () => {
      clearInterval(id);
      if (swap) clearTimeout(swap);
    };
  }, [slides.length]);

  const slide = slides[index] ?? slides[0];
  if (!slide) return null;

  return (
    <div
      aria-live="off"
      className={`transition-opacity duration-500 ease-in-out ${visible ? "opacity-100" : "opacity-0"}`}
    >
      <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-navy sm:text-5xl lg:text-6xl">
        {slide.lead}
        <br />
        <span className="text-orange">{slide.accent}</span>
      </h1>
      <p className="mt-5 max-w-md text-base leading-relaxed text-ink sm:text-lg">
        {slide.lines.map((line, i) => (
          <span key={line}>
            {i > 0 && <br className="hidden sm:inline" />}
            {i > 0 ? ` ${line}` : line}
          </span>
        ))}
      </p>
    </div>
  );
}
