import Image from "next/image";
import Link from "next/link";
import { formatMoney, type PropertySummary } from "@serrote/domain";
import { SiteHeader } from "@/components/site-header";
import { HeroVideo } from "@/components/hero-video";
import { SiteFooter } from "@/components/site-footer";
import { SearchPanel } from "@/components/search-panel";
import { PropertyCarousel, type CarouselItem } from "@/components/property-carousel";
import { RotatingImage } from "@/components/rotating-image";
import { AdBanners } from "@/components/ad-banners";
import { VideoGallery } from "@/components/video-gallery";
import { YouTubeChannelSection } from "@/components/youtube-channel";
import { getHomeContent } from "@/lib/content";
import { DEMO_FEATURED } from "@/lib/featured-demo";
import { formatArea, transactionLabels } from "@/lib/labels";
import { getFeaturedProperties } from "@/lib/properties";
import { whatsappLink } from "@/lib/site";

// Render on demand so featured listings are read from the database at runtime.
export const dynamic = "force-dynamic";

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M4 11l8-7 8 7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9h12v-9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 19v-5h4v5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconKey() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <circle cx="8" cy="8" r="4" />
      <path d="M11 11l8 8M16 16l2-2M18 18l2-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <rect x="5" y="4" width="14" height="16" rx="1.5" />
      <path d="M9 8h2M13 8h2M9 12h2M13 12h2M10.5 20v-4h3v4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconConsulting() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M4 19V5M4 19h16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 16l3.5-4 3 2.5L20 8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 8h4v4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const SERVICES = [
  {
    id: "compra-e-venda",
    title: "Compra e venda",
    description: "Acompanhamento completo na aquisição e venda do seu imóvel, com avaliação e negociação.",
    icon: <IconHome />,
  },
  {
    id: "arrendamento",
    title: "Arrendamento",
    description: "Encontre o imóvel certo para arrendar ou confie-nos a gestão do seu património.",
    icon: <IconKey />,
  },
  {
    id: "gestao-imobiliaria",
    title: "Gestão imobiliária",
    description: "Administração de rendas, manutenção e contratos para proprietários e investidores.",
    icon: <IconBuilding />,
  },
  {
    id: "consultoria",
    title: "Consultoria imobiliária",
    description: "Análise de mercado, avaliação de terrenos e apoio à decisão de investimento em Angola.",
    icon: <IconConsulting />,
  },
] as const;

const HIGHLIGHTS = [
  "Apoio local em Luanda e arredores",
  "Documentação e processos verificados",
  "Acompanhamento personalizado",
];

function toCarouselItem(property: PropertySummary): CarouselItem {
  return {
    id: property.id,
    href: `/imoveis/${property.slug}`,
    badge: transactionLabels[property.transactionType],
    price: formatMoney(property.price),
    title: property.title,
    location: `${property.municipality}, ${property.province}`,
    bedrooms: property.bedrooms ?? null,
    bathrooms: property.bathrooms ?? null,
    area: formatArea(property.areaM2),
    image: property.mainImageUrl ?? "/photos/interior.jpg",
    reference: property.reference,
  };
}

export default async function HomePage() {
  const featured = await getFeaturedProperties(8);
  const content = await getHomeContent();
  const isDemo = featured.length < 3;
  const carouselItems: CarouselItem[] = isDemo ? DEMO_FEATURED : featured.map(toCarouselItem);
  const wa = whatsappLink("Olá! Gostaria de solicitar uma consultoria imobiliária.");

  return (
    <>
      <SiteHeader overlay />

      <main id="conteudo">
        {/* Hero */}
        <section className="relative isolate overflow-hidden bg-cream dark:bg-navy-deep">
          <HeroVideo />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_right,rgba(250,246,238,0.94)_0%,rgba(250,246,238,0.72)_34%,rgba(250,246,238,0)_62%)] dark:bg-[linear-gradient(to_right,rgba(11,13,15,0.94)_0%,rgba(11,13,15,0.72)_34%,rgba(11,13,15,0)_62%)]"
          />

          <div className="relative mx-auto max-w-7xl px-4 pb-36 pt-32 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-10">
              <div className="max-w-2xl">
                <p aria-hidden className="invisible text-xs font-bold uppercase tracking-[0.26em] text-orange">
                  Bem-vindo à Serrote Imobiliária
                </p>
                <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-navy sm:text-5xl lg:text-6xl">
                  Mais que imóveis,
                  <br />
                  <span className="text-orange">entregamos confiança.</span>
                </h1>
                <p className="mt-5 max-w-md text-base leading-relaxed text-ink sm:text-lg">
                  Encontre o imóvel ideal para o seu futuro.
                  <br className="hidden sm:inline" /> Casas, apartamentos, terrenos e muito mais.
                  <br className="hidden sm:inline" /> Tudo em um só lugar.
                </p>
                <div className="mt-7 flex items-center gap-3">
                  <Link
                    href="/imoveis"
                    className="grid size-12 shrink-0 place-items-center rounded-full bg-orange text-white shadow-elevated transition-colors hover:bg-orange-hover"
                    aria-label="Explorar imóveis"
                  >
                    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="M5 12h13M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                  <Link href="/imoveis" className="text-sm font-semibold text-navy hover:text-orange">
                    Explorar imóveis
                  </Link>
                </div>
              </div>

              <div className="hidden max-w-[240px] shrink-0 rounded-card bg-canvas/95 p-5 shadow-elevated backdrop-blur lg:block">
                <p className="font-display text-base font-bold leading-snug text-navy">
                  O seu próximo imóvel pode estar aqui.
                </p>
                <p className="mt-2 text-xs text-ink-muted">
                  Pesquise por tipo, localização e preço.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Search — straddles the hero edge */}
        <div className="relative z-20 mx-auto -mt-20 max-w-5xl px-4 sm:px-6 lg:px-8">
          <SearchPanel variant="hero" />
        </div>

        {/* Featured properties — cinematic 3D carousel */}
        <section aria-labelledby="destaques" className="pb-16 pt-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <h2 id="destaques" className="font-display text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
                  Imóveis em <span className="text-orange">Destaque</span>
                </h2>
                <p className="mt-2 text-sm text-ink-muted sm:text-base">
                  Selecionamos para si os melhores imóveis, com localização privilegiada e todo o
                  conforto que merece.
                </p>
              </div>
              <Link
                href="/imoveis"
                className="group inline-flex items-center gap-2.5 text-sm font-semibold text-orange hover:text-orange-hover"
              >
                Ver todos os imóveis
                <span
                  aria-hidden
                  className="grid size-8 place-items-center rounded-full border border-orange text-orange transition-colors group-hover:bg-orange group-hover:text-white"
                >
                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h13M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>

{!isDemo && <PropertyCarousel items={carouselItems} />}
        {isDemo && (
          <PropertyCarousel
            items={carouselItems.map((item) => ({
              ...item,
              badge: "Demonstração",
              href: "/imoveis",
            }))}
          />
        )}
      </section>

        <AdBanners ads={content.ads} />

        {/* Why Serrote */}
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-card border border-line bg-canvas shadow-card">
            <div className="grid lg:grid-cols-2">
              <div className="relative min-h-[280px] lg:min-h-[440px]">
                <RotatingImage
                  images={[
                    "/photos/city.jpg",
                    "/photos/interior.jpg",
                    "/photos/prop-1.jpg",
                    "/photos/prop-2.jpg",
                    "/photos/prop-3.jpg",
                  ]}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>
              <div className="p-8 sm:p-10 lg:p-12">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange">
                  Por que escolher a Serrote?
                </p>
                <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
                  O seu sonho,
                  <br />
                  <span className="text-orange">o nosso compromisso.</span>
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-ink-muted sm:text-base">
                  Conhecemos o mercado angolano e acompanhamos cada cliente desde a primeira pesquisa
                  até à entrega das chaves. Trabalhamos com transparência, rigor documental e atenção
                  ao detalhe.
                </p>
                <ul className="mt-6 space-y-3">
                  {HIGHLIGHTS.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-ink">
                      <span
                        aria-hidden
                        className="grid size-5 shrink-0 place-items-center rounded-full bg-orange text-white"
                      >
                        <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/contacto"
                    className="inline-flex h-11 items-center rounded-full bg-orange px-6 text-sm font-semibold text-white transition-colors hover:bg-orange-hover"
                  >
                    Pedir consultoria
                  </Link>
                  {wa && (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 items-center rounded-full border border-line-strong px-6 text-sm font-semibold text-navy transition-colors hover:border-orange hover:text-orange"
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <VideoGallery videos={content.videos} channelUrl={content.youtube.url} />

        <YouTubeChannelSection channel={content.youtube} />

        {/* Services */}
        <section aria-labelledby="servicos" className="border-y border-line bg-canvas-soft">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange">
                Os nossos serviços
              </p>
              <h2 id="servicos" className="mt-3 font-display text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
                Soluções completas em
                <br />
                <span className="text-orange">imóveis.</span>
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-ink-muted sm:text-base">
                Da compra à gestão, estamos ao seu lado em todas as etapas do processo.
              </p>
              <Link
                href="/servicos"
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-full border border-line-strong px-6 text-sm font-semibold text-navy transition-colors hover:border-orange hover:text-orange"
              >
                Conheça os nossos serviços →
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {SERVICES.map((service, index) => (
                <Link
                  key={service.id}
                  href={`/servicos#${service.id}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-canvas p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:border-orange/40 hover:shadow-elevated"
                >
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-orange transition-transform duration-300 group-hover:scale-x-100"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute right-3 -top-3 font-display text-6xl font-extrabold leading-none text-ink/5 transition-colors duration-300 group-hover:text-orange/10"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="grid size-12 place-items-center rounded-control border border-orange/15 bg-orange-soft text-orange transition-colors duration-300 group-hover:border-orange group-hover:bg-orange group-hover:text-white">
                    {service.icon}
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold tracking-tight text-navy">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{service.description}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-ink-muted transition-colors duration-300 group-hover:text-orange">
                    Saber mais
                    <span
                      aria-hidden
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Conversion band */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-card shadow-card">
            <div className="grid lg:grid-cols-2">
              <div className="relative min-h-[240px] lg:min-h-[340px]">
                <Image
                  src="/photos/interior.jpg"
                  alt=""
                  aria-hidden
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="bg-orange p-8 text-white sm:p-10 lg:p-12">
                <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Pronto para dar o próximo passo?
                </h2>
                <p className="mt-3 text-sm text-white/85 sm:text-base">
                  Fale com a nossa equipa e receba apoio personalizado — sem compromisso.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/contacto"
                    className="inline-flex h-11 items-center rounded-full bg-white px-6 text-sm font-semibold text-navy transition-colors hover:bg-cream"
                  >
                    Pedir consultoria
                  </Link>
                  {wa && (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 items-center rounded-full border border-white/40 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
