import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Sobre nós",
  description:
    "Conheça a Serrote Imobiliária — a chave para a sua nova história. Serviço imobiliário com transparência em Angola.",
};

const PRINCIPLES = [
  {
    title: "Transparência",
    description:
      "Informação clara sobre o imóvel, o processo e os documentos em cada etapa, para que decida com confiança.",
  },
  {
    title: "Rigor documental",
    description:
      "Cada operação é acompanhada com atenção ao detalhe documental, evitando surpresas no percurso.",
  },
  {
    title: "Conhecimento local",
    description:
      "Trabalhamos no mercado angolano, com atenção às zonas, às dinâmicas e às reais necessidades de cada cliente.",
  },
  {
    title: "Acompanhamento próximo",
    description:
      "Da primeira pesquisa até à entrega das chaves, tem uma equipa a acompanhar o seu processo.",
  },
] as const;

export default function SobrePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-line bg-canvas-soft">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-orange">
              Sobre a Serrote
            </p>
            <h1 className="mt-3 max-w-3xl font-display text-3xl font-extrabold tracking-tight text-navy dark:text-ink sm:text-4xl">
              O seu sonho, <span className="text-orange">o nosso compromisso.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">
              A Serrote Imobiliária existe para tornar a compra, venda e arrendamento de imóveis
              em Angola um processo simples, transparente e acompanhado. A nossa marca é a chave
              para a sua nova história.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-2xl font-extrabold tracking-tight text-navy dark:text-ink sm:text-3xl">
                Como trabalhamos
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-ink-muted sm:text-base">
                Acompanhamos cada cliente desde a primeira pesquisa até à entrega das chaves.
                Trabalhamos com transparência, rigor documental e atenção ao detalhe, porque uma
                decisão imobiliária raramente é tomada de ânimo leve.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-ink-muted sm:text-base">
                Seja a sua primeira casa, um investimento ou a gestão do seu património, o
                processo é o mesmo: informação verdadeira, comunicação directa e acompanhamento
                até ao fim.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/imoveis"
                  className="inline-flex h-11 items-center rounded-control bg-orange px-6 text-sm font-semibold text-white transition-colors hover:bg-orange-hover"
                >
                  Explorar imóveis
                </Link>
                <Link
                  href="/contacto"
                  className="inline-flex h-11 items-center rounded-control border border-line px-6 text-sm font-semibold text-ink transition-colors hover:border-line-strong"
                >
                  Falar connosco
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {PRINCIPLES.map((principle) => (
                <div
                  key={principle.title}
                  className="rounded-card border border-line bg-canvas p-5 shadow-card"
                >
                  <span className="grid size-10 place-items-center rounded-control bg-orange-soft text-orange">
                    <svg
                      viewBox="0 0 24 24"
                      className="size-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold text-navy dark:text-ink">
                    {principle.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {principle.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-line bg-canvas-soft">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-card bg-navy px-6 py-12 text-white sm:px-12">
              <div className="mx-auto max-w-2xl text-center">
                <p className="font-display text-xl font-bold text-white/90 sm:text-2xl">
                  “A chave para sua nova história.”
                </p>
                <div className="mt-7">
                  <Link
                    href="/contacto"
                    className="inline-flex h-11 items-center rounded-control bg-orange px-6 text-sm font-semibold text-white hover:bg-orange-hover"
                  >
                    Falar com a equipa
                  </Link>
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
