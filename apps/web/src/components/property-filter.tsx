"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ListingSource, PropertyType, TransactionType } from "@regis/domain";
import {
  TIPOLOGIA_OPTIONS,
  listingSourceLabels,
  propertyTypeLabels,
  transactionLabels,
} from "@/lib/labels";
import { PROVINCES } from "@regis/domain";

export interface PropertyFilterValues {
  listingSource: ListingSource[];
  transactionType: string;
  propertyType: string;
  tipologia: string;
  province: string;
  municipality: string;
  neighborhood: string;
  minPrice: string;
  maxPrice: string;
  q: string;
}

interface PropertyFilterProps {
  values: PropertyFilterValues;
  municipalities: string[];
  neighborhoods: string[];
  totalResults: number;
}

const selectClass =
  "h-11 w-full rounded-control border border-line bg-canvas px-3 text-sm text-ink outline-none transition-colors focus:border-accent";
const inputClass =
  "h-11 w-full rounded-control border border-line bg-canvas px-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-accent";

function parseTipologia(value: string): string {
  return value;
}

export function PropertyFilter({
  values,
  municipalities: initialMunicipalities,
  neighborhoods: initialNeighborhoods,
  totalResults,
}: PropertyFilterProps) {
  const router = useRouter();
  const [municipalities, setMunicipalities] = useState(initialMunicipalities);
  const [neighborhoods, setNeighborhoods] = useState(initialNeighborhoods);
  const [listingSource, setListingSource] = useState<ListingSource[]>(values.listingSource);
  const [province, setProvince] = useState(values.province);
  const [municipality, setMunicipality] = useState(values.municipality);
  const [neighborhood, setNeighborhood] = useState(values.neighborhood);

  // Track which province/neighborhood lists were already fetched to avoid
  // redundant requests and never setState synchronously inside the effects.
  const fetchedProvince = useRef(values.province);
  const fetchedNeighborhoodsKey = useRef(
    values.municipality ? `${values.province}|${values.municipality}` : "",
  );

  // Load municipalities when province changes (initial set comes from the server).
  useEffect(() => {
    if (!province) {
      fetchedProvince.current = "";
      return;
    }
    if (fetchedProvince.current === province) return;
    fetchedProvince.current = province;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(
          `/api/locations?province=${encodeURIComponent(province)}`,
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          municipalities: string[];
          neighborhoods: string[];
        };
        if (cancelled) return;
        setMunicipalities(data.municipalities);
      } catch {
        /* ignore network errors — keeps previous options */
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [province]);

  // Load neighborhoods when municipality changes (initial set comes from the server).
  useEffect(() => {
    if (!province || !municipality) {
      fetchedNeighborhoodsKey.current = "";
      return;
    }
    const key = `${province}|${municipality}`;
    if (fetchedNeighborhoodsKey.current === key) return;
    fetchedNeighborhoodsKey.current = key;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(
          `/api/locations?province=${encodeURIComponent(province)}&municipality=${encodeURIComponent(municipality)}`,
        );
        if (!res.ok) return;
        const data = (await res.json()) as { neighborhoods: string[] };
        if (!cancelled) setNeighborhoods(data.neighborhoods);
      } catch {
        /* ignore */
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [municipality, province]);

  const onProvinceChange = (value: string) => {
    setProvince(value);
    setMunicipality("");
    setNeighborhood("");
    setMunicipalities([]);
    setNeighborhoods([]);
  };

  const onMunicipalityChange = (value: string) => {
    setMunicipality(value);
    setNeighborhood("");
    setNeighborhoods([]);
  };

  const toggleSource = useCallback((source: ListingSource) => {
    setListingSource((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source],
    );
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    const append = (key: string, value: string | undefined | null) => {
      if (value && value.trim()) params.set(key, value.trim());
    };

    // Listing source: both or none = no filter (show all).
    const sources = listingSource;
    if (sources.length === 1 && sources[0]) {
      params.set("listingSource", sources[0]);
    } else if (sources.length > 1) {
      params.set("listingSource", sources.join(","));
    }

    append("transactionType", String(form.get("transactionType") ?? ""));
    append("propertyType", String(form.get("propertyType") ?? ""));
    append("bedrooms", String(form.get("tipologia") ?? ""));
    append("province", province);
    append("municipality", municipality);
    append("neighborhood", neighborhood);
    append("minPrice", String(form.get("minPrice") ?? ""));
    append("maxPrice", String(form.get("maxPrice") ?? ""));
    append("q", String(form.get("q") ?? ""));

    const qs = params.toString();
    router.push(qs ? `/imoveis?${qs}` : "/imoveis");
  };

  const clearFilters = () => {
    setListingSource([]);
    setProvince("");
    setMunicipality("");
    setNeighborhood("");
    router.push("/imoveis");
  };

  const hasFilters =
    listingSource.length > 0 ||
    !!values.transactionType ||
    !!values.propertyType ||
    !!values.tipologia ||
    !!province ||
    !!municipality ||
    !!neighborhood ||
    !!values.minPrice ||
    !!values.maxPrice ||
    !!values.q;

  const resultLabel =
    totalResults === 0
      ? "0 RESULTADOS"
      : `${totalResults.toLocaleString("pt-AO")} ${totalResults === 1 ? "RESULTADO" : "RESULTADOS"}`;

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Filtrar imóveis"
      className="rounded-card border border-line bg-canvas p-4 shadow-card sm:p-5"
    >
      {/* Anunciante */}
      <fieldset className="border-0 p-0">
        <legend className="mr-1 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
          Anunciante
        </legend>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          {(Object.keys(listingSourceLabels) as ListingSource[]).map((source) => (
            <label
              key={source}
              className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink"
            >
              <input
                type="checkbox"
                checked={listingSource.includes(source)}
                onChange={() => toggleSource(source)}
                className="size-4 rounded border-line-strong accent-accent"
              />
              {listingSourceLabels[source] === "Profissional"
                ? "PROFISSIONAIS"
                : "PARTICULARES"}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Tipo de negócio */}
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-ink-muted">Tipo de negócio</span>
          <select
            name="transactionType"
            defaultValue={values.transactionType ?? ""}
            className={selectClass}
          >
            <option value="">Todos</option>
            {(Object.keys(transactionLabels) as TransactionType[]).map((t) => (
              <option key={t} value={t}>
                {transactionLabels[t]}
              </option>
            ))}
          </select>
        </label>

        {/* Tipo de imóvel */}
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-ink-muted">Tipo de imóvel</span>
          <select
            name="propertyType"
            defaultValue={values.propertyType ?? ""}
            className={selectClass}
          >
            <option value="">Todos</option>
            {(Object.keys(propertyTypeLabels) as PropertyType[]).map((t) => (
              <option key={t} value={t}>
                {propertyTypeLabels[t]}
              </option>
            ))}
          </select>
        </label>

        {/* Tipologia */}
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-ink-muted">Tipologia</span>
          <select
            name="tipologia"
            defaultValue={parseTipologia(values.tipologia ?? "")}
            className={selectClass}
          >
            <option value="">Qualquer</option>
            {TIPOLOGIA_OPTIONS.map((opt) => (
              <option key={opt.value} value={String(opt.minBedrooms)}>
                {opt.label}
                {opt.minBedrooms > 0 ? ` (${opt.minBedrooms}+)` : " (estúdio)"}
              </option>
            ))}
          </select>
        </label>

        {/* País (fixo) */}
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-ink-muted">País</span>
          <input type="text" value="Angola" readOnly className={`${selectClass} opacity-70`} />
        </label>

        {/* Província */}
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-ink-muted">Província</span>
          <select
            value={province}
            onChange={(e) => onProvinceChange(e.target.value)}
            className={selectClass}
          >
            <option value="">Todas</option>
            {PROVINCES.map((p) => (
              <option key={p.slug} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        {/* Município */}
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-ink-muted">Município</span>
          <select
            value={municipality}
            onChange={(e) => onMunicipalityChange(e.target.value)}
            disabled={!province}
            className={selectClass}
          >
            <option value="">
              {province ? "Todos os municípios" : "Escolha a província"}
            </option>
            {municipalities.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        {/* Zona */}
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-ink-muted">Zona</span>
          <select
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            disabled={!municipality}
            className={selectClass}
          >
            <option value="">
              {municipality ? "Todas as zonas" : "Escolha o município"}
            </option>
            {neighborhoods.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        {/* Preço */}
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-ink-muted">Preço mínimo (Kz)</span>
          <input
            type="number"
            name="minPrice"
            min={0}
            step={100000}
            inputMode="numeric"
            defaultValue={values.minPrice ?? ""}
            placeholder="Mínimo"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-ink-muted">Preço máximo (Kz)</span>
          <input
            type="number"
            name="maxPrice"
            min={0}
            step={100000}
            inputMode="numeric"
            defaultValue={values.maxPrice ?? ""}
            placeholder="Máximo"
            className={inputClass}
          />
        </label>

        {/* Pesquisa textual */}
        <label className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
          <span className="text-xs font-semibold text-ink-muted">Pesquisar</span>
          <input
            type="search"
            name="q"
            defaultValue={values.q ?? ""}
            placeholder="Pesquisar por título, descrição, referência, zona…"
            className={inputClass}
          />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-control bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.2-3.2" strokeLinecap="round" />
          </svg>
          {resultLabel}
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-semibold text-ink-muted hover:text-ink"
          >
            Limpar filtros
          </button>
        )}
      </div>
    </form>
  );
}
