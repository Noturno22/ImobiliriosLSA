"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { whatsappLink } from "@/lib/site";

export type CarouselItem = {
  id: string;
  href: string;
  badge: string;
  price: string;
  title: string;
  location: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: string | null;
  image: string;
  reference?: string | null;
};

type Pose = {
  tx: number;
  ry: number;
  z: number;
  scale: number;
  opacity: number;
  blur: number;
  layer: number;
};

/**
 * Coverflow-style depth map: 0 is the focused card, ±1 flank it and ±2 are the
 * partially visible "ghost" cards that bleed off the edges of the viewport.
 */
function poseAt(offset: number): Pose {
  const sign = offset < 0 ? -1 : 1;
  const mag = Math.abs(offset);

  if (mag === 0) return { tx: 0, ry: 0, z: 0, scale: 1.05, opacity: 1, blur: 0, layer: 40 };
  if (mag === 1)
    return { tx: sign * 106, ry: sign * 13, z: -190, scale: 0.87, opacity: 1, blur: 0, layer: 30 };
  return { tx: sign * 315, ry: sign * 27, z: -480, scale: 0.68, opacity: 0.4, blur: 5, layer: 20 };
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function BedIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M3 18v-5a2 2 0 012-2h14a2 2 0 012 2v5M3 18h18M6 11V8a2 2 0 012-2h8a2 2 0 012 2v3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BathIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M5 12V6a2 2 0 012-2h1.5M5 12h14v2a4 4 0 01-4 4H9a4 4 0 01-4-4v-2zM8 20l-1 1M16 20l1 1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AreaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M4 9h16M9 4v16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M5 12h13M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Stat({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted">
      <span aria-hidden className="text-orange">{icon}</span>
      {children}
    </span>
  );
}

function Card({ item }: { item: CarouselItem }) {
  return (
    <article className="sr-card-in group relative w-[320px] overflow-hidden rounded-[18px] border border-line/60 bg-canvas/85 shadow-elevated ring-1 ring-line/40 backdrop-blur-xl transition-transform duration-300 sm:w-[400px]">
      <div className="relative aspect-[16/10] overflow-hidden bg-canvas-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt=""
          loading="lazy"
          className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
        />
        {/* vidrado — diagonal glass sheen across the photo */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(118deg,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0.16)_20%,rgba(255,255,255,0)_46%)] dark:bg-[linear-gradient(118deg,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.15)_20%,rgba(0,0,0,0)_46%)] mix-blend-screen"
        />
        {/* vidrado — glossy inner edge + soft bottom shading */}
        <span aria-hidden className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/40 dark:ring-white/10" />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(to_top,rgba(23,40,59,0.28),rgba(23,40,59,0))] dark:bg-[linear-gradient(to_top,rgba(0,0,0,0.5),rgba(0,0,0,0))]"
        />
        <span className="absolute bottom-0 left-5 translate-y-1/2 rounded-pill bg-orange px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-md">
          {item.badge}
        </span>
      </div>

      <div className="px-5 pb-5 pt-6">
        <p className="font-display text-2xl font-extrabold leading-tight tracking-tight text-ink">
          {item.price}
        </p>
        <h3 className="mt-1 min-h-[2.75rem] text-base font-semibold leading-snug text-ink">
          {item.title}
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
          <span className="text-orange">
            <PinIcon />
          </span>
          {item.location}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3">
          {item.bedrooms != null && <Stat icon={<BedIcon />}>{item.bedrooms}</Stat>}
          {item.bathrooms != null && <Stat icon={<BathIcon />}>{item.bathrooms}</Stat>}
          {item.area && <Stat icon={<AreaIcon />}>{item.area}</Stat>}
        </div>
      </div>

      {/* vidrado — glass reflection highlight across the card surface */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[18px] bg-[linear-gradient(158deg,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0)_30%)] dark:bg-[linear-gradient(158deg,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0)_30%)] mix-blend-overlay"
      />
    </article>
  );
}

function Skyline({ className, idSuffix }: { className: string; idSuffix: string }) {
  const winId = `sr-win-${idSuffix}`;
  return (
    <svg
      className={className}
      viewBox="0 0 220 260"
      aria-hidden
      focusable="false"
      fill="currentColor"
    >
      <defs>
        <pattern id={winId} width="18" height="24" patternUnits="userSpaceOnUse">
          <rect x="4" y="5" width="8" height="9" fill="currentColor" opacity="0.5" />
        </pattern>
      </defs>
      <g>
        <rect x="0" y="150" width="44" height="110" />
        <rect x="50" y="70" width="52" height="190" />
        <rect x="108" y="120" width="40" height="140" />
        <rect x="154" y="34" width="54" height="226" />
        <rect x="0" y="150" width="44" height="110" fill={`url(#${winId})`} />
        <rect x="50" y="70" width="52" height="190" fill={`url(#${winId})`} />
        <rect x="108" y="120" width="40" height="140" fill={`url(#${winId})`} />
        <rect x="154" y="34" width="54" height="226" fill={`url(#${winId})`} />
      </g>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function QuickView({ item, onClose }: { item: CarouselItem; onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const wa = whatsappLink(
    `Olá! Tenho interesse no imóvel: ${item.title} (${item.price}).`,
  );

  return createPortal(
    <div className="fixed inset-0 z-[100] grid place-items-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-navy-deep/70 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        className="relative grid w-full max-w-4xl overflow-hidden rounded-[20px] border border-line bg-canvas shadow-elevated md:grid-cols-2"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-canvas-muted md:aspect-auto md:h-full md:min-h-[340px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image} alt="" className="size-full object-cover" />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(23,40,59,0.35),rgba(23,40,59,0))]"
          />
          <span className="absolute left-5 top-5 rounded-pill bg-orange px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-md">
            {item.badge}
          </span>
        </div>

        <div className="flex flex-col p-6 sm:p-8">
          <p className="font-display text-3xl font-extrabold leading-tight tracking-tight text-ink">
            {item.price}
          </p>
          <h2 className="mt-1.5 text-xl font-semibold leading-snug text-ink">{item.title}</h2>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-muted">
            <span className="text-orange">
              <PinIcon />
            </span>
            {item.location}
          </p>
          {item.reference && (
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-subtle">
              Ref. {item.reference}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-line py-4">
            {item.bedrooms != null && <Stat icon={<BedIcon />}>{item.bedrooms}</Stat>}
            {item.bathrooms != null && <Stat icon={<BathIcon />}>{item.bathrooms}</Stat>}
            {item.area && <Stat icon={<AreaIcon />}>{item.area}</Stat>}
          </div>

          <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row">
            <Link
              href={item.href}
              className="group inline-flex flex-1 items-center justify-center gap-2 rounded-pill bg-orange px-5 py-3 text-sm font-semibold text-white shadow-card transition-colors hover:bg-orange-hover"
            >
              Ver imóvel completo
              <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-pill border border-line px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-orange hover:text-orange"
              >
                Falar por WhatsApp
              </a>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 grid size-9 place-items-center rounded-full border border-line bg-canvas/90 text-ink shadow-card backdrop-blur transition-colors hover:border-orange hover:text-orange"
        >
          <CloseIcon />
        </button>
      </div>
    </div>,
    document.body,
  );
}

export function PropertyCarousel({ items }: { items: CarouselItem[] }) {
  const count = items.length;
  const [index, setIndex] = useState(1);
  const [openItem, setOpenItem] = useState<CarouselItem | null>(null);

  if (count === 0) return null;

  const go = (step: number) => setIndex((prev) => (prev + step + count) % count);

  const slots = items
    .map((item, i) => {
      const raw = ((i - index) % count + count) % count;
      const offset = raw > Math.floor(count / 2) ? raw - count : raw;
      return { item, offset };
    })
    .filter((slot) => Math.abs(slot.offset) <= 2);

  return (
    <div
      role="region"
      aria-roledescription="carrossel"
      aria-label="Imóveis em destaque"
      className="relative mt-9 overflow-hidden"
    >
      <Skyline
        idSuffix="l"
        className="pointer-events-none absolute bottom-2 left-0 h-[210px] w-[190px] text-mist opacity-40"
      />
      <Skyline
        idSuffix="r"
        className="pointer-events-none absolute bottom-2 right-0 h-[230px] w-[200px] -scale-x-100 text-mist opacity-40"
      />

      <div className="relative mx-auto h-[460px] max-w-[1320px] sm:h-[520px]" style={{ perspective: "1600px" }}>
        {slots.map(({ item, offset }) => {
          const pose = poseAt(offset);
          return (
            <div
              key={item.id}
              className="absolute left-1/2 top-1/2 transition-[transform,opacity,filter] duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] will-change-transform"
              style={{
                zIndex: pose.layer,
                opacity: pose.opacity,
                filter: pose.blur ? `blur(${pose.blur}px)` : undefined,
                transform: `translate(-50%,-50%) translateX(${pose.tx}%) rotateY(${pose.ry}deg) translateZ(${pose.z}px) scale(${pose.scale})`,
              }}
            >
              <button
                type="button"
                onClick={() => setOpenItem(item)}
                aria-haspopup="dialog"
                aria-label={`Ver detalhes: ${item.title}`}
                className="block cursor-pointer text-left group focus-visible:outline-none"
              >
                <span className="block rounded-[16px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange">
                  <Card item={item} />
                </span>
              </button>
            </div>
          );
        })}

        <p className="sr-only" aria-live="polite">
          Cartão {index + 1} de {count}
        </p>
      </div>

      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Cartão anterior"
        className="absolute left-4 top-1/2 z-50 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-canvas text-ink shadow-card transition-colors hover:border-orange hover:text-orange sm:left-8"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Cartão seguinte"
        className="absolute right-4 top-1/2 z-50 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-canvas text-ink shadow-card transition-colors hover:border-orange hover:text-orange sm:right-8"
      >
        <ArrowIcon className="size-5" />
      </button>

      {openItem && <QuickView item={openItem} onClose={() => setOpenItem(null)} />}
    </div>
  );
}
