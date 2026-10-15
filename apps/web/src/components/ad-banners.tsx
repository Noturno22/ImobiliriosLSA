import Image from "next/image";
import Link from "next/link";
import type { AdBanner } from "@/lib/content";

/**
 * Advertising area — a labelled band of sponsor banners. Renders nothing when
 * there are no active banners, so the home page stays clean until the space is
 * sold.
 */
export function AdBanners({ ads }: { ads: AdBanner[] }) {
  if (ads.length === 0) return null;

  return (
    <section aria-labelledby="publicidade" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-center gap-4">
        <h2
          id="publicidade"
          className="shrink-0 text-xs font-bold uppercase tracking-[0.2em] text-ink-subtle"
        >
          Publicidade
        </h2>
        <span aria-hidden className="h-px flex-1 bg-line" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {ads.map((ad) => (
          <AdCard key={ad.id} ad={ad} />
        ))}
      </div>
    </section>
  );
}

function AdCard({ ad }: { ad: AdBanner }) {
  const external = /^https?:\/\//.test(ad.href);

  const content = (
    <>
      <Image
        src={ad.imageUrl}
        alt=""
        aria-hidden
        fill
        sizes="(min-width: 640px) 50vw, 100vw"
        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
      <span
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(20,40,59,0.94)_0%,rgba(20,40,59,0.72)_45%,rgba(20,40,59,0.25)_100%)]"
      />
      <div className="relative flex min-h-[150px] flex-col justify-center p-6 text-white">
        <span className="w-fit rounded-pill bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/90">
          {ad.sponsor}
        </span>
        <h3 className="mt-3 font-display text-lg font-bold tracking-tight">{ad.title}</h3>
        {ad.description && (
          <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-white/80">{ad.description}</p>
        )}
        {ad.ctaLabel && (
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange">
            {ad.ctaLabel}
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M5 12h13M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>
    </>
  );

  const className =
    "group relative flex overflow-hidden rounded-card border border-line shadow-card transition-shadow hover:shadow-elevated";

  return external ? (
    <a href={ad.href} target="_blank" rel="noopener noreferrer" className={className}>
      {content}
    </a>
  ) : (
    <Link href={ad.href} className={className}>
      {content}
    </Link>
  );
}
