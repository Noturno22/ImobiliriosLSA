import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Política de privacidade da Regis Properties.",
  robots: { index: false, follow: true },
};

export default function PrivacidadePage() {
  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.26em] text-accent">Legal</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-navy dark:text-ink">
          Política de Privacidade
        </h1>

        <div className="mt-6 rounded-card border border-dashed border-line-strong bg-canvas-soft p-6">
          <p className="font-display text-base font-bold text-navy dark:text-ink">
            Conteúdo pendente de revisão jurídica
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Esta política será redigida com um advogado local, conforme exigido pelo Master
            Prompt (§17 — “privacy, consent, retention and data-subject handling processes in
            consultation with qualified local legal counsel”). Optámos por não apresentar texto
            legal inventado.
          </p>
        </div>

        <section className="mt-8 space-y-4 text-sm leading-relaxed text-ink-muted">
          <h2 className="font-display text-lg font-bold text-navy dark:text-ink">
            Dados que tratamos hoje
          </h2>
          <p>
            Enquanto esta política não está publicada, o formulário de contacto recolhe apenas o
            que é necessário para responder ao seu pedido: nome, telefone, email opcional, tipo
            de pedido e mensagem opcional, acrescido do seu consentimento explícito.
          </p>
          <p>
            Esses dados são usados exclusivamente para responder ao contacto e não são partilhados
            com terceiros para fins de marketing.
          </p>

          <h2 className="mt-6 font-display text-lg font-bold text-navy dark:text-ink">
            O que ficará definido
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Responsável pelo tratamento e contactos oficiais</li>
            <li>Base legal e finalidades de cada tratamento</li>
            <li>Períodos de conservação dos dados de contactos e pedidos de visita</li>
            <li>Direitos do titular e forma de os exercer</li>
            <li>Uso de cookies e tecnologias semelhantes</li>
            <li>Transferências internacionais, quando existirem</li>
          </ul>
        </section>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-control border border-line px-6 text-sm font-semibold text-ink transition-colors hover:border-line-strong"
          >
            Voltar ao início
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
