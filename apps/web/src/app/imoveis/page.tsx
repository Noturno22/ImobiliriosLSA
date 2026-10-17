import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PropertyCard } from "@/components/property-card";
import {
  parseSearchParams,
  searchProperties,
  type PropertySearchInput,
} from "@/lib/properties";
import { PROVINCES, PropertyType, TransactionType } from "@serrote/domain";
import { propertyTypeLabels, transactionLabels } from "@/lib/labels";

export const metadata: Metadata = {
  title: "Imóveis",
  description:
    "Pesquise casas, apartamentos, terrenos e imóveis comerciais para compra ou arrendamento em Angola.",
};

const selectClass =
  "h-11 w-full rounded-control border border-line bg-canvas px-3 text-sm text-ink outline-none transition-colors focus:border-orange";

function buildQuery(input: PropertySearchInput, overrides: Partial<PropertySearchInput>) {
  const merged: Record<string, string | number | undefined> = {
    transactionType: input.transactionType,
    propertyType: input.propertyType,
    province: input.province,
    minPrice: input.minPrice,
    maxPrice: input.maxPrice,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    ...overrides,
  };

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value == null || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "/imoveis";
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`inline-flex h-9 items-center rounded-pill border px-4 text-sm font-semibold transition-colors ${
        active
          ? "border-orange bg-orange text-white"
          : "border-line bg-canvas text-ink hover:border-orange hover:text-orange"
      }`}
    >
      {children}
    </Link>
  );
}

type Param = string | string[] | undefined;

export default async function ImoveisPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, Param>>;
}) {
  const input = parseSearchParams(await searchParams);
  const { items, total, page, pageCount } = await searchProperties(input);

  const active: { key: keyof PropertySearchInput; label: string; href: string }[] = [];
  if (input.transactionType)
    active.push({
      key: "transactionType",
      label: transactionLabels[input.transactionType as TransactionType] ?? input.transactionType,
      href: buildQuery(input, { transactionType: undefined }),
    });
  if (input.propertyType)
    active.push({
      key: "propertyType",
      label: propertyTypeLabels[input.propertyType as PropertyType] ?? input.propertyType,
      href: buildQuery(input, { propertyType: undefined }),
    });
  if (input.province)
    active.push({ key: "province", label: input.province, href: buildQuery(input, { province: undefined }) });
  if (input.minPrice != null)
    active.push({
      key: "minPrice",
      label: `Mín. ${input.minPrice.toLocaleString("pt-AO")} Kz`,
      href: buildQuery(input, { minPrice: undefined }),
    });
  if (input.maxPrice != null)
    active.push({
      key: "maxPrice",
      label: `Máx. ${input.maxPrice.toLocaleString("pt-AO")} Kz`,
      href: buildQuery(input, { maxPrice: undefined }),
    });
  if (input.bedrooms != null)
    active.push({
      key: "bedrooms",
      label: `${input.bedrooms}+ quartos`,
      href: buildQuery(input, { bedrooms: undefined }),
    });

  const hasFilters = active.length > 0;

  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.26em] text-orange">Imóveis</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-navy dark:text-ink sm:text-4xl">
          Encontre o seu próximo imóvel
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Filtre por operação, tipo, localização e faixa de preço. Os filtros ficam no URL, pelo
          que pode partilhar ou guardar a pesquisa.
        </p>

        <div className="mt-7 rounded-card border border-line bg-canvas p-4 shadow-card sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-ink-subtle">Operação</span>
            <FilterChip
              href={buildQuery(input, { transactionType: undefined, page: undefined })}
              active={!input.transactionType}
            >
              Todos
            </FilterChip>
            {(Object.keys(transactionLabels) as TransactionType[]).map((t) => (
              <FilterChip
                key={t}
                href={buildQuery(input, { transactionType: t, page: undefined })}
                active={input.transactionType === t}
              >
                {transactionLabels[t]}
              </FilterChip>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-ink-subtle">Quartos</span>
            <FilterChip
              href={buildQuery(input, { bedrooms: undefined, page: undefined })}
              active={input.bedrooms == null}
            >
              Qualquer
            </FilterChip>
            {[1, 2, 3, 4, 5].map((n) => (
              <FilterChip
                key={n}
                href={buildQuery(input, { bedrooms: n, page: undefined })}
                active={input.bedrooms === n}
              >
                {n}+
              </FilterChip>
            ))}
          </div>

          <form
            action="/imoveis"
            method="get"
            role="search"
            aria-label="Filtrar imóveis"
            className="mt-5 border-t border-line pt-5"
          >
            <input type="hidden" name="transactionType" value={input.transactionType ?? ""} />
            <input type="hidden" name="bedrooms" value={input.bedrooms ?? ""} />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-ink-muted">Tipo de imóvel</span>
                <select name="propertyType" defaultValue={input.propertyType ?? ""} className={selectClass}>
                  <option value="">Qualquer tipo</option>
                  {(Object.keys(propertyTypeLabels) as PropertyType[]).map((t) => (
                    <option key={t} value={t}>{propertyTypeLabels[t]}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-ink-muted">Província</span>
                <select name="province" defaultValue={input.province ?? ""} className={selectClass}>
                  <option value="">Todas as províncias</option>
                  {PROVINCES.map((p) => (
                    <option key={p.slug} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-ink-muted">Preço mínimo (Kz)</span>
                <input
                  type="number" name="minPrice" min={0} step={100000} inputMode="numeric"
                  defaultValue={input.minPrice ?? ""} placeholder="0" className={selectClass}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-ink-muted">Preço máximo (Kz)</span>
                <input
                  type="number" name="maxPrice" min={0} step={100000} inputMode="numeric"
                  defaultValue={input.maxPrice ?? ""} placeholder="Sem limite" className={selectClass}
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-control bg-orange px-6 text-sm font-semibold text-white transition-colors hover:bg-orange-hover"
              >
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.2-3.2" strokeLinecap="round" />
                </svg>
                Pesquisar imóveis
              </button>
              {hasFilters && (
                <Link href="/imoveis" className="text-sm font-semibold text-ink-muted hover:text-ink">
                  Limpar filtros
                </Link>
              )}
            </div>
          </form>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          <p aria-live="polite" className="text-sm text-ink-muted">
            {total === 0
              ? "Nenhum imóvel corresponde aos filtros."
              : `${total} ${total === 1 ? "imóvel encontrado" : "imóveis encontrados"}`}
          </p>
          {active.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {active.map((chip) => (
                <li key={chip.key}>
                  <Link
                    href={chip.href}
                    className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-canvas-soft px-3 py-1 text-xs font-medium text-ink hover:border-line-strong"
                  >
                    {chip.label}
                    <span aria-hidden>×</span>
                    <span className="sr-only">Remover filtro</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 ? (
          <>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {pageCount > 1 && (
              <nav aria-label="Paginação" className="mt-10 flex items-center justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={buildQuery(input, { page: page - 1 })}
                    className="rounded-control border border-line px-4 py-2 text-sm font-semibold text-ink hover:border-line-strong"
                  >
                    Anterior
                  </Link>
                )}
                <span className="px-3 text-sm text-ink-muted">
                  Página {page} de {pageCount}
                </span>
                {page < pageCount && (
                  <Link
                    href={buildQuery(input, { page: page + 1 })}
                    className="rounded-control border border-line px-4 py-2 text-sm font-semibold text-ink hover:border-line-strong"
                  >
                    Seguinte
                  </Link>
                )}
              </nav>
            )}
          </>
        ) : (
          <div className="mt-6 rounded-card border border-dashed border-line-strong bg-canvas-soft p-10 text-center">
            <p className="font-display text-lg font-bold text-navy dark:text-ink">
              Ainda não há imóveis publicados
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
              Assim que a equipa Serrote publicar imóveis, eles aparecem aqui automaticamente,
              respeitando os filtros que definiu.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                href="/contacto"
                className="inline-flex h-10 items-center rounded-control bg-orange px-5 text-sm font-semibold text-white hover:bg-orange-hover"
              >
                Falar connosco
              </Link>
              {hasFilters && (
                <Link
                  href="/imoveis"
                  className="inline-flex h-10 items-center rounded-control border border-line px-5 text-sm font-semibold text-ink hover:border-line-strong"
                >
                  Limpar filtros
                </Link>
              )}
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
