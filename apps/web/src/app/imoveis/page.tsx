import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PropertyCard } from "@/components/property-card";
import { PropertyFilter, type PropertyFilterValues } from "@/components/property-filter";
import {
  buildQueryString,
  getMunicipalities,
  getNeighborhoods,
  parseSearchParams,
  searchProperties,
} from "@/lib/properties";
import {
  ListingSource,
  PropertyType,
  TransactionType,
} from "@regis/domain";
import {
  TIPOLOGIA_OPTIONS,
  listingSourceLabels,
  propertyTypeLabels,
  transactionLabels,
} from "@/lib/labels";

export const metadata: Metadata = {
  title: "Imóveis",
  description:
    "Pesquise casas, apartamentos, terrenos e imóveis comerciais para compra ou arrendamento em Angola.",
};

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
          ? "border-accent bg-accent text-white"
          : "border-line bg-canvas text-ink hover:border-accent hover:text-accent"
      }`}
    >
      {children}
    </Link>
  );
}

type Param = string | string[] | undefined;

function tipologiaLabel(bedrooms: number | undefined): string | null {
  if (bedrooms == null) return null;
  const opt = TIPOLOGIA_OPTIONS.find((o) => o.minBedrooms === bedrooms);
  return opt ? opt.label : `${bedrooms}+`;
}

export default async function ImoveisPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, Param>>;
}) {
  const raw = await searchParams;
  const input = parseSearchParams(raw);
  const [{ items, total, page, pageCount }, municipalities, neighborhoods] =
    await Promise.all([
      searchProperties(input),
      getMunicipalities(input.province),
      input.municipality
        ? getNeighborhoods(input.province, input.municipality)
        : Promise.resolve([]),
    ]);

  const filterValues: PropertyFilterValues = {
    listingSource: input.listingSource ?? [],
    transactionType: input.transactionType ?? "",
    propertyType: input.propertyType ?? "",
    tipologia: input.bedrooms != null ? String(input.bedrooms) : "",
    province: input.province ?? "",
    municipality: input.municipality ?? "",
    neighborhood: input.neighborhood ?? "",
    minPrice: input.minPrice != null ? String(input.minPrice) : "",
    maxPrice: input.maxPrice != null ? String(input.maxPrice) : "",
    q: input.q ?? "",
  };

  const active: { key: string; label: string; href: string }[] = [];
  if (input.listingSource && input.listingSource.length > 0) {
    const labels = input.listingSource
      .map((s) => listingSourceLabels[s as ListingSource] ?? s)
      .join(", ");
    active.push({
      key: "listingSource",
      label: labels,
      href: buildQueryString(input, { listingSource: [] }),
    });
  }
  if (input.transactionType)
    active.push({
      key: "transactionType",
      label: transactionLabels[input.transactionType as TransactionType] ?? input.transactionType,
      href: buildQueryString(input, { transactionType: undefined }),
    });
  if (input.propertyType)
    active.push({
      key: "propertyType",
      label: propertyTypeLabels[input.propertyType as PropertyType] ?? input.propertyType,
      href: buildQueryString(input, { propertyType: undefined }),
    });
  if (input.bedrooms != null)
    active.push({
      key: "bedrooms",
      label: tipologiaLabel(input.bedrooms) ?? `${input.bedrooms}+ quartos`,
      href: buildQueryString(input, { bedrooms: undefined }),
    });
  if (input.province)
    active.push({
      key: "province",
      label: input.province,
      href: buildQueryString(input, { province: undefined, municipality: undefined, neighborhood: undefined }),
    });
  if (input.municipality)
    active.push({
      key: "municipality",
      label: input.municipality,
      href: buildQueryString(input, { municipality: undefined, neighborhood: undefined }),
    });
  if (input.neighborhood)
    active.push({
      key: "neighborhood",
      label: input.neighborhood,
      href: buildQueryString(input, { neighborhood: undefined }),
    });
  if (input.minPrice != null)
    active.push({
      key: "minPrice",
      label: `Mín. ${input.minPrice.toLocaleString("pt-AO")} Kz`,
      href: buildQueryString(input, { minPrice: undefined }),
    });
  if (input.maxPrice != null)
    active.push({
      key: "maxPrice",
      label: `Máx. ${input.maxPrice.toLocaleString("pt-AO")} Kz`,
      href: buildQueryString(input, { maxPrice: undefined }),
    });
  if (input.q)
    active.push({
      key: "q",
      label: `“${input.q}”`,
      href: buildQueryString(input, { q: undefined }),
    });

  const hasFilters = active.length > 0;

  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.26em] text-accent">Imóveis</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-navy dark:text-ink sm:text-4xl">
          Encontre o seu próximo imóvel
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Filtre por anunciante, operação, tipo, tipologia, localização e faixa de preço. Os
          filtros ficam no URL, pelo que pode partilhar ou guardar a pesquisa.
        </p>

        <div className="mt-7">
          <PropertyFilter
            values={filterValues}
            municipalities={municipalities}
            neighborhoods={neighborhoods}
            totalResults={total}
          />
        </div>

        {/* Quick chips: operação + tipologia */}
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
              Operação
            </span>
            <FilterChip
              href={buildQueryString(input, { transactionType: undefined, page: undefined })}
              active={!input.transactionType}
            >
              Todos
            </FilterChip>
            {(Object.keys(transactionLabels) as TransactionType[]).map((t) => (
              <FilterChip
                key={t}
                href={buildQueryString(input, { transactionType: t, page: undefined })}
                active={input.transactionType === t}
              >
                {transactionLabels[t]}
              </FilterChip>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
              Tipologia
            </span>
            <FilterChip
              href={buildQueryString(input, { bedrooms: undefined, page: undefined })}
              active={input.bedrooms == null}
            >
              Qualquer
            </FilterChip>
            {TIPOLOGIA_OPTIONS.map((opt) => (
              <FilterChip
                key={opt.value}
                href={buildQueryString(input, { bedrooms: opt.minBedrooms, page: undefined })}
                active={input.bedrooms === opt.minBedrooms}
              >
                {opt.label}
              </FilterChip>
            ))}
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          <p aria-live="polite" className="text-sm text-ink-muted">
            {total === 0
              ? "Nenhum imóvel corresponde aos filtros."
              : `${total.toLocaleString("pt-AO")} ${total === 1 ? "imóvel encontrado" : "imóveis encontrados"}`}
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
                    href={buildQueryString(input, { page: page - 1 })}
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
                    href={buildQueryString(input, { page: page + 1 })}
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
              Nenhum imóvel corresponde aos filtros
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
              Tente alargar a pesquisa ou limpar alguns filtros para ver mais resultados.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                href="/contacto"
                className="inline-flex h-10 items-center rounded-control bg-accent px-5 text-sm font-semibold text-white hover:bg-accent-hover"
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
