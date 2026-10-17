import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Serviços",
  description:
    "Compra e venda, arrendamento, gestão imobiliária e consultoria imobiliária em Angola.",
};

const SERVICES = [
  {
    id: "compra-e-venda",
    title: "Compra e venda",
    summary:
      "Acompanhamento completo na aquisição e venda do seu imóvel, com avaliação e negociação.",
    points: [
      "Avaliação do imóvel com base em dados reais de mercado",
      "Apoio na negociação e na definição do preço de saída",
      "Verificação e acompanhamento da documentação",
      "Apoio até à conclusão da escritura",
    ],
  },
  {
    id: "arrendamento",
    title: "Arrendamento",
    summary:
      "Encontre o imóvel certo para arrendar ou confie-nos a gestão do seu património.",
    points: [
      "Seleção de imóveis conforme o seu orçamento e zona",
      "Apoio na visita e na análise das condições do contrato",
      "Colocação de inquilinos para proprietários",
      "Acompanhamento do contrato ao longo da renda",
    ],
  },
  {
    id: "gestao-imobiliaria",
    title: "Gestão imobiliária",
    summary:
      "Administração de rendas, manutenção e contratos para proprietários e investidores.",
    points: [
      "Cobrança e gestão de rendas",
      "Coordenação de manutenção e intervenções",
      "Gestão documental de contratos e renovações",
      "Relatórios regulares ao proprietário",
    ],
  },
  {
    id: "consultoria",
    title: "Consultoria imobiliária",
    summary:
      "Análise de mercado, avaliação de terrenos e apoio à decisão de investimento em Angola.",
    points: [
      "Análise de mercado e de zonas de crescimento",
      "Avaliação de terrenos e potencial construtivo",
      "Apoio à decisão de investimento imobiliário",
      "Segunda opinião em operações de maior dimensão",
    ],
  },
] as const;

export default function ServicosPage() {
  const wa = whatsappLink("Olá! Gostaria de saber mais sobre os serviços da Serrote Imobiliária.");

  return (
    <>
      <SiteHeader />
      <main id="conteudo">
        <section className="border-b border-line bg-canvas-soft">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-orange">
              Os nossos serviços
            </p>
            <h1 className="mt-3 max-w-3xl font-display text-3xl font-extrabold tracking-tight text-navy dark:text-ink sm:text-4xl">
              Soluções completas{" "}
              <span className="text-orange">em imóveis.</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">
              Da compra à gestão, estamos ao seu lado em todas as etapas do processo.
            </p>

            <nav aria-label="Serviços" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SERVICES.map((service, index) => (
                <a
                  key={service.id}
                  href={`#${service.id}`}
                  className="group flex flex-col rounded-card border border-line bg-canvas p-5 shadow-card transition-shadow hover:shadow-elevated"
                >
                  <span className="grid size-11 place-items-center rounded-control bg-orange-soft font-display text-lg font-extrabold text-orange">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2 className="mt-4 font-display text-base font-bold text-navy dark:text-ink">
                    {service.title}
                  </h2>
                  <span className="mt-2 text-sm font-semibold text-orange group-hover:underline">
                    Saber mais →
                  </span>
                </a>
              ))}
            </nav>
          </div>
        </section>

        {SERVICES.map((service) => (
          <section
            key={service.id}
            id={service.id}
            aria-labelledby={`${service.id}-title`}
            className="scroll-mt-24 border-b border-line"
          >
            <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
              <div>
                <h2
                  id={`${service.id}-title`}
                  className="font-display text-2xl font-extrabold tracking-tight text-navy dark:text-ink sm:text-3xl"
                >
                  {service.title}
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted sm:text-base">
                  {service.summary}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/contacto"
                    className="inline-flex h-11 items-center rounded-control bg-orange px-6 text-sm font-semibold text-white transition-colors hover:bg-orange-hover"
                  >
                    Pedir orçamento
                  </Link>
                  <Link
                    href="/imoveis"
                    className="inline-flex h-11 items-center rounded-control border border-line px-6 text-sm font-semibold text-ink transition-colors hover:border-line-strong"
                  >
                    Ver imóveis
                  </Link>
                </div>
              </div>

              <ul className="space-y-3">
                {service.points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm text-ink">
                    <span
                      aria-hidden
                      className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-orange text-white"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="size-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-card bg-navy px-6 py-12 text-white sm:px-12">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                Quer avançar sem compromissos?
              </h2>
              <p className="mt-3 text-sm text-white/80 sm:text-base">
                Fale com a nossa equipa e receba apoio personalizado — sem compromisso.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link
                  href="/contacto"
                  className="inline-flex h-11 items-center rounded-control bg-orange px-6 text-sm font-semibold text-white hover:bg-orange-hover"
                >
                  Pedir consultoria
                </Link>
                {wa && (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center rounded-control border border-white/25 px-6 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
