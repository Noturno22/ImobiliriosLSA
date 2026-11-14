"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Cross-fades through a list of decorative images on an interval. Used for the
 * "Por que escolher a Regis?" panel so the visual stays alive without
 * competing with the main content.
 */
export function RotatingImage({
  images,
  intervalMs = 60000,
  sizes = "100vw",
}: {
  images: string[];
  intervalMs?: number;
  sizes?: string;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      setActive((current) => (current + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [images.length, intervalMs]);

  return (
    <>
      {images.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt=""
          aria-hidden
          fill
          sizes={sizes}
          priority={index === 0}
          className={`object-cover transition-opacity duration-1000 ease-in-out ${
            index === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </>
  );
}