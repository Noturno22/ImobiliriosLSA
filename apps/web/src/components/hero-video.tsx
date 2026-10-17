"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const SOURCES: Record<Theme, { src: string; poster: string }> = {
  light: { src: "/photos/hero.mp4", poster: "/photos/hero.webp" },
  dark: { src: "/photos/hero-n.mp4", poster: "/photos/hero-n.webp" },
};

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

export function HeroVideo() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { src, poster } = SOURCES[theme];

  return (
    <video
      key={src}
      aria-hidden
      className="absolute inset-0 size-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
