"use client";

import { useState } from "react";
import { PropertyType, PROVINCES } from "@regis/domain";
import { propertyTypeLabels } from "@/lib/labels";

type PriceRange = { value: string; label: string; min?: number; max?: number };

/**
 * Price bands are UI filter options only (they map to minPrice/maxPrice URL
 * params in Kz, as read by parseSearchParams). They are not business claims.
 */
const PRICE_RANGES: PriceRange[] = [
  { value: "", label: "Sem limite" },
  { value: "0-50000000", label: "Até Kz 50.000.000", max: 50_000_000 },
  { value: "50000000-150000000", label: "Kz 50.000.000 – 150.000.000", min: 50_000_000, max: 150_000_000 },
  { value: "150000000-400000000", label: "Kz 150.000.000 – 400.000.000", min: 150_000_000, max: 400_000_000 },
  { value: "400000000-", label: "Acima de Kz 400.000.000", min: 400_000_000 },
];

const labelClass = "text-[11px] font-semibold uppercase tracking-wide text-ink-subtle";
const selectClass =
  "w-full cursor-pointer appearance-none bg-transparent text-sm font-semibold text-navy outline-none";

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-ink-subtle" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TypeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M4 11l8-7 8 7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9h12v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function PriceIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/**
 * Property search panel. Submits as a normal GET form to /imoveis so filters
 * become URL params. The hero variant renders as a single horizontal pill.
 */
export function SearchPanel({ variant = "hero" }: { variant?: "hero" | "inline" }) {
  const [range, setRange] = useState("");
  const selected = PRICE_RANGES.find((r) => r.value === range);

  return (
    <form
      action="/imoveis"
      method="get"
      role="search"
      aria-label="Pesquisar imóveis"
      className={`rounded-card border border-line bg-canvas/95 p-3 shadow-elevated backdrop-blur sm:p-4 ${
        variant === "hero" ? "lg:rounded-pill" : ""
      }`}
    >
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-0">
        <label className="flex flex-1 items-center gap-3 px-3 py-2">
          <span className="text-accent">
            <TypeIcon />
          </span>
          <span className="flex flex-1 flex-col">
            <span className={labelClass}>Tipo de imóvel</span>
            <select name="propertyType" defaultValue="" className={selectClass}>
              <option value="">Qualquer tipo</option>
              {(Object.keys(propertyTypeLabels) as PropertyType[]).map((t) => (
                <option key={t} value={t}>
                  {propertyTypeLabels[t]}
                </option>
              ))}
            </select>
          </span>
          <Chevron />
        </label>

        <span aria-hidden className="mx-3 hidden h-10 w-px bg-line lg:block" />

        <label className="flex flex-1 items-center gap-3 px-3 py-2">
          <span className="text-accent">
            <PinIcon />
          </span>
          <span className="flex flex-1 flex-col">
            <span className={labelClass}>Localização</span>
            <select name="province" defaultValue="" className={selectClass}>
              <option value="">Todas as províncias</option>
              {PROVINCES.map((p) => (
                <option key={p.slug} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </span>
          <Chevron />
        </label>

        <span aria-hidden className="mx-3 hidden h-10 w-px bg-line lg:block" />

        <label className="flex flex-1 items-center gap-3 px-3 py-2">
          <span className="text-accent">
            <PriceIcon />
          </span>
          <span className="flex flex-1 flex-col">
            <span className={labelClass}>Faixa de preço</span>
            <select value={range} onChange={(e) => setRange(e.target.value)} className={selectClass}>
              {PRICE_RANGES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </span>
          <Chevron />
        </label>

        <input type="hidden" name="minPrice" value={selected?.min ?? ""} />
        <input type="hidden" name="maxPrice" value={selected?.max ?? ""} />

        <button
          type="submit"
          className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-pill bg-accent px-7 text-sm font-semibold text-white transition-colors hover:bg-accent-hover lg:mt-0 lg:ml-2"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.2-3.2" strokeLinecap="round" />
          </svg>
          Buscar
        </button>
      </div>
    </form>
  );
}
