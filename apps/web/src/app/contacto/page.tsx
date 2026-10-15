import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ContactForm } from "@/components/contact-form";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Fale com a Serrote Imobiliária. Peça uma consultoria, peça informação sobre um imóvel ou marque uma visita.",
};

export default function ContactoPage() {
  const wa = whatsappLink("Olá! Gostaria de falar com a Serrote Imobiliária.");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.26em] text-orange">Contacto</p>
        <h1 className="mt-3 max-w-3xl font-display text-3xl font-extrabold tracking-tight text-navy dark:text-ink sm:text-4xl">
          Vamos encontrar o seu próximo imóvel
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">
          Preencha o formulário ou fale connosco directamente. Respondemos aos pedidos assim que
          possível, em horário útil.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ContactForm />
          </div>

          <aside className="space-y-4 lg:col-span-2">
            <div className="rounded-card border border-line bg-canvas p-5 shadow-card">
              <h2 className="font-display text-base font-bold text-navy dark:text-ink">
                Falar por WhatsApp
              </h2>
              {wa ? (
                <>
                  <p className="mt-2 text-sm text-ink-muted">
                    A forma mais rápida de falar com a nossa equipa.
                  </p>
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-control bg-orange px-6 text-sm font-semibold text-white transition-colors hover:bg-orange-hover"
                  >
                    Abrir WhatsApp
                  </a>
                </>
              ) : (
                <p className="mt-2 text-sm text-ink-muted">
                  O número oficial de WhatsApp será activado em breve. Pode deixar o seu pedido no
                  formulário ao lado.
                </p>
              )}
            </div>

            <div className="rounded-card border border-line bg-canvas p-5 shadow-card">
              <h2 className="font-display text-base font-bold text-navy dark:text-ink">
                Consultoria imobiliária
              </h2>
              <p className="mt-2 text-sm text-ink-muted">
                Prefere iniciar pelo imóvel? Explore o catálogo ou fale connosco para uma
                recomendação ajustada ao seu caso.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href="/imoveis"
                  className="inline-flex h-11 w-full items-center justify-center rounded-control border border-line px-6 text-sm font-semibold text-ink transition-colors hover:border-line-strong"
                >
                  Ver imóveis
                </Link>
                <Link
                  href="/servicos"
                  className="inline-flex h-11 w-full items-center justify-center rounded-control border border-line px-6 text-sm font-semibold text-ink transition-colors hover:border-line-strong"
                >
                  Conhecer serviços
                </Link>
              </div>
            </div>

            <p className="rounded-card border border-line bg-canvas-soft p-5 text-xs leading-relaxed text-ink-muted">
              Os seus dados são usados apenas para responder a este pedido. Consulte a nossa{" "}
              <a href="/politica-de-privacidade" className="font-semibold text-orange hover:underline">
                Política de Privacidade
              </a>
              .
            </p>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
