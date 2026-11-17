import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatMoney } from "@regis/domain";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PropertyCard } from "@/components/property-card";
import { PropertyGallery } from "@/components/property-gallery";
import { PropertyLeadForm } from "@/components/property-lead-form";
import {
  getPropertyBySlug,
  getSimilarProperties,
} from "@/lib/properties";
import {
  formatAmenityLabel,
  formatArea,
  propertyTypeLabels,
  statusLabels,
  transactionLabels,
} from "@/lib/labels";
import { site, whatsappLink } from "@/lib/site";
import { parseVideoUrl } from "@/lib/videos";

type Params = { slug: string };

/** Renders an embedded video (YouTube/direct) for the property detail page. */
function PropertyVideo({ url, title }: { url: string; title: string }) {
  const parsed = parseVideoUrl(url);
  if (!parsed) return null;

  return (
    <section aria-labelledby="video-titulo" className="overflow-hidden rounded-card border border-line bg-navy-deep">
      <h2 id="video-titulo" className="sr-only">
        Vídeo do imóvel
      </h2>
      {parsed.kind === "youtube" ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${parsed.id}?rel=0`}
          title={`Vídeo — ${title}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="aspect-video w-full"
        />
      ) : parsed.kind === "direct" ? (
        <video src={parsed.url} controls playsInline className="aspect-video w-full object-cover" />
      ) : (
        <div className="grid aspect-video place-items-center p-6 text-center">
          <a
            href={parsed.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center rounded-control bg-accent px-4 text-sm font-semibold text-white"
          >
            Ver vídeo no TikTok
          </a>
        </div>
      )}
    </section>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  // The root `loading.tsx` streams the shell, so a missing slug is delivered
  // with HTTP 200. Keep the correct title and mark it noindex explicitly.
  if (!property) return { title: "Imóvel não encontrado", robots: { index: false, follow: false } };

  const description = property.description.replace(/\s+/g, " ").trim().slice(0, 155);
  const image = property.mainImageUrl ?? undefined;

  return {
    title: property.title,
    description,
    alternates: { canonical: `/imoveis/${property.slug}` },
    openGraph: {
      type: "article",
      title: property.title,
      description,
      url: `/imoveis/${property.slug}`,
      images: image ? [{ url: image, alt: property.title }] : undefined,
    },
  };
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function BedIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M3 18v-5a2 2 0 012-2h14a2 2 0 012 2v5M3 18h18M6 11V8a2 2 0 012-2h8a2 2 0 012 2v3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BathIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M5 12V6a2 2 0 012-2h1.5M5 12h14v2a4 4 0 01-4 4H9a4 4 0 01-4-4v-2zM8 20l-1 1M16 20l1 1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M5 16l1.4-4.2A2 2 0 018.3 10h7.4a2 2 0 011.9 1.8L19 16M4 16h16v3h-2M4 16v3h2M6.5 19a1 1 0 100-2 1 1 0 000 2zm11 0a1 1 0 100-2 1 1 0 000 2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AreaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M4 9h16M9 4v16" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const SCHEMA_TYPE: Record<string, string> = {
  HOUSE: "House",
  VILLA: "House",
  APARTMENT: "Apartment",
  LAND: "Place",
  COMMERCIAL: "Place",
  OFFICE: "Place",
  WAREHOUSE: "Place",
};

export default async function ImovelPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const similar = await getSimilarProperties(property, 3);

  const images = property.media.filter((m) => m.type === "IMAGE");
  const videos = property.media.filter((m) => m.type === "VIDEO");

  const galleryImages = images.map((m) => ({
    id: m.id,
    url: m.url,
    alt: m.alt || property.title,
    caption: m.caption,
  }));

  // First playable video (YouTube preferred for embedding)
  const firstVideo = videos[0];

  const location = [property.neighborhood, property.municipality, property.province]
    .filter(Boolean)
    .join(", ");

  const priceLabel = `${formatMoney(property.price)}${
    property.transactionType === "RENT" ? "/mês" : ""
  }`;

  const wa = whatsappLink(
    `Olá! Tenho interesse no imóvel "${property.title}" (Ref. ${property.reference}). Podem dar-me mais informações?`,
  );

  const stats = [
    { key: "bedrooms", icon: <BedIcon />, value: property.bedrooms, label: "Quartos" },
    { key: "bathrooms", icon: <BathIcon />, value: property.bathrooms, label: "Casas de banho" },
    { key: "parking", icon: <CarIcon />, value: property.parkingSpaces, label: "Estacionamentos" },
  ].filter((s) => s.value != null);

  const area = formatArea(property.areaM2);
  const lotArea = formatArea(property.lotAreaM2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": SCHEMA_TYPE[property.propertyType] ?? "Place",
    name: property.title,
    description: property.description.replace(/\s+/g, " ").trim(),
    url: new URL(`/imoveis/${property.slug}`, site.url).toString(),
    image: property.media.map((m) => m.url),
    ...(property.bedrooms != null ? { numberOfRooms: property.bedrooms } : {}),
    ...(property.areaM2 != null
      ? { floorSize: { "@type": "QuantitativeValue", value: property.areaM2, unitCode: "MTK" } }
      : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: property.municipality,
      addressRegion: property.province,
      addressCountry: "AO",
    },
    offers: {
      "@type": "Offer",
      price: String(property.price.amountMinor / 100),
      priceCurrency: property.price.currency,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <SiteHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main id="conteudo" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav aria-label="Navegação estrutural" className="text-xs text-ink-muted">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-ink">Início</Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/imoveis" className="hover:text-ink">Imóveis</Link>
            </li>
            <li aria-hidden>/</li>
            <li className="font-medium text-ink" aria-current="page">
              {property.reference}
            </li>
          </ol>
        </nav>

        {property.status === "RESERVED" && (
          <p
            role="status"
            className="mt-4 rounded-control border border-warning/30 bg-warning/10 px-4 py-3 text-sm font-medium text-ink"
          >
            Este imóvel encontra-se atualmente {statusLabels[property.status].toLowerCase()}. Contacte-nos
            para conhecer alternativas semelhantes.
          </p>
        )}

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
            <PropertyGallery images={galleryImages} title={property.title} />
            {firstVideo && <PropertyVideo url={firstVideo.url} title={property.title} />}
          </div>

          <aside className="flex flex-col gap-6 self-start rounded-card border border-line bg-canvas p-6 shadow-card lg:sticky lg:top-24">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-pill bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                {transactionLabels[property.transactionType]}
              </span>
              <span className="rounded-pill border border-line bg-canvas-soft px-3 py-1 text-xs font-semibold text-ink-muted">
                {propertyTypeLabels[property.propertyType]}
              </span>
            </div>

            <div>
              <h1 className="font-display text-2xl font-extrabold leading-tight tracking-tight text-navy dark:text-ink">
                {property.title}
              </h1>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-muted">
                <span className="text-accent">
                  <PinIcon />
                </span>
                {location}
              </p>
            </div>

            <div className="border-y border-line py-4">
              <p className="font-display text-3xl font-extrabold tracking-tight text-navy dark:text-ink">
                {priceLabel}
              </p>
              <p className="mt-1 text-xs text-ink-subtle">Ref. {property.reference}</p>
            </div>

            {(stats.length > 0 || area || lotArea) && (
              <ul className="grid grid-cols-2 gap-4">
                {stats.map((stat) => (
                  <li key={stat.key} className="flex items-center gap-3">
                    <span aria-hidden className="text-accent">{stat.icon}</span>
                    <span className="flex flex-col">
                      <span className="font-display text-base font-bold text-navy dark:text-ink">
                        {stat.value}
                      </span>
                      <span className="text-xs text-ink-muted">{stat.label}</span>
                    </span>
                  </li>
                ))}
                {area && (
                  <li className="flex items-center gap-3">
                    <span aria-hidden className="text-accent"><AreaIcon /></span>
                    <span className="flex flex-col">
                      <span className="font-display text-base font-bold text-navy dark:text-ink">{area}</span>
                      <span className="text-xs text-ink-muted">Área útil</span>
                    </span>
                  </li>
                )}
                {lotArea && (
                  <li className="flex items-center gap-3">
                    <span aria-hidden className="text-accent"><AreaIcon /></span>
                    <span className="flex flex-col">
                      <span className="font-display text-base font-bold text-navy dark:text-ink">{lotArea}</span>
                      <span className="text-xs text-ink-muted">Área do terreno</span>
                    </span>
                  </li>
                )}
              </ul>
            )}

            <div className="flex flex-col gap-3">
              <a
                href="#pedido"
                className="inline-flex h-11 items-center justify-center rounded-control bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
              >
                Agendar visita
              </a>
              {wa ? (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center rounded-control border border-line-strong px-6 text-sm font-semibold text-navy transition-colors hover:border-accent hover:text-accent"
                >
                  Falar no WhatsApp
                </a>
              ) : (
                <Link
                  href="/contacto"
                  className="inline-flex h-11 items-center justify-center rounded-control border border-line-strong px-6 text-sm font-semibold text-navy transition-colors hover:border-accent hover:text-accent"
                >
                  Falar connosco
                </Link>
              )}
            </div>
          </aside>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-8">
            {property.description && (
              <section aria-labelledby="descricao">
                <h2 id="descricao" className="font-display text-xl font-extrabold text-navy dark:text-ink">
                  Descrição
                </h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-muted">
                  {property.description}
                </p>
              </section>
            )}

            {property.amenities.length > 0 && (
              <section aria-labelledby="comodidades">
                <h2 id="comodidades" className="font-display text-xl font-extrabold text-navy dark:text-ink">
                  Comodidades
                </h2>
                <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {property.amenities.map((amenity) => (
                    <li key={amenity} className="flex items-center gap-2 text-sm text-ink">
                      <span aria-hidden className="grid size-5 shrink-0 place-items-center rounded-full bg-accent text-white">
                        <CheckIcon />
                      </span>
                      {formatAmenityLabel(amenity)}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section aria-labelledby="localizacao">
              <h2 id="localizacao" className="font-display text-xl font-extrabold text-navy dark:text-ink">
                Localização
              </h2>
              <p className="mt-3 flex items-center gap-1.5 text-sm text-ink-muted">
                <span className="text-accent"><PinIcon /></span>
                {location}
              </p>
              <p className="mt-2 text-xs text-ink-subtle">
                A localização é aproximada por razões de privacidade. Contacte-nos para indicações exatas.
              </p>
            </section>
          </div>

          <section id="pedido" aria-labelledby="pedido-titulo" className="self-start lg:sticky lg:top-24">
            <h2 id="pedido-titulo" className="font-display text-xl font-extrabold text-navy dark:text-ink">
              Interesse neste imóvel?
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Envie o seu pedido e a nossa equipa responde com toda a informação.
            </p>
            <div className="mt-4">
              <PropertyLeadForm propertyId={property.id} propertyTitle={property.title} />
            </div>
          </section>
        </div>

        {similar.length > 0 && (
          <section aria-labelledby="semelhantes" className="mt-16">
            <h2 id="semelhantes" className="font-display text-2xl font-extrabold tracking-tight text-navy dark:text-ink">
              Imóveis semelhantes
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((item) => (
                <PropertyCard key={item.id} property={item} />
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
