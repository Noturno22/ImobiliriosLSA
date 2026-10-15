import Link from "next/link";
import { formatMoney, type PropertySummary } from "@serrote/domain";
import { formatArea, propertyTypeLabels, transactionLabels } from "@/lib/labels";

function Stat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted">
      <span aria-hidden className="text-ink-subtle">
        {icon}
      </span>
      {label}
    </span>
  );
}

export function PropertyCard({ property }: { property: PropertySummary }) {
  const area = formatArea(property.areaM2);

  return (
    <article className="group flex flex-col overflow-hidden rounded-card border border-line bg-canvas shadow-card transition-shadow hover:shadow-elevated">
      <Link
        href={`/imoveis/${property.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-canvas-muted"
        aria-label={`Ver ${property.title}`}
      >
        {property.mainImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={property.mainImageUrl}
            alt={property.title}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="grid size-full place-items-center bg-gradient-to-br from-navy to-navy-deep text-mist">
            <span className="px-4 text-center text-xs font-medium tracking-wide">
              Fotografia do imóvel indisponível
            </span>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-pill bg-orange px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
          {transactionLabels[property.transactionType]}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-orange">
          {propertyTypeLabels[property.propertyType]} · {property.municipality}
        </p>
        <h3 className="mt-1.5 line-clamp-2 font-display text-base font-bold leading-snug text-navy dark:text-ink">
          <Link href={`/imoveis/${property.slug}`} className="hover:text-orange">
            {property.title}
          </Link>
        </h3>

        <p className="mt-3 font-display text-xl font-extrabold text-navy dark:text-ink">
          {formatMoney(property.price)}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3">
          {property.bedrooms != null && (
            <Stat
              label={`${property.bedrooms} quartos`}
              icon={
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 18v-5a2 2 0 012-2h14a2 2 0 012 2v5M3 18h18M6 11V8a2 2 0 012-2h8a2 2 0 012 2v3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
          )}
          {property.bathrooms != null && (
            <Stat
              label={`${property.bathrooms} WC`}
              icon={
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M5 12V6a2 2 0 012-2h1.5M5 12h14v2a4 4 0 01-4 4H9a4 4 0 01-4-4v-2zM8 20l-1 1M16 20l1 1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
          )}
          {area && (
            <Stat
              label={area}
              icon={
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <path d="M4 9h16M9 4v16" strokeLinecap="round" />
                </svg>
              }
            />
          )}
        </div>

        <p className="mt-3 text-xs text-ink-subtle">Ref. {property.reference}</p>
      </div>
    </article>
  );
}
