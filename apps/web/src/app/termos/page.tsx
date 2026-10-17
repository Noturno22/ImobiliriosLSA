import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Termos de Utilização",
  description: "Termos de utilização da Serrote Imobiliária.",
  robots: { index: false, follow: true },
};

export default function TermosPage() {
  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.26em] text-orange">Legal</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-navy dark:text-ink">
          Termos de Utilização
        </h1>

        <div className="mt-6 rounded-card border border-dashed border-line-strong bg-canvas-soft p-6">
          <p className="font-display text-base font-bold text-navy dark:text-ink">
            Conteúdo pendente de revisão jurídica
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Estes termos serão redigidos com um advogado local antes da publicação. Optámos por
            não apresentar texto legal inventado, em conformidade com o Master Prompt (§17 e
            §24 — não inventar informação comercial ou jurídica).
          </p>
        </div>

        <section className="mt-8 space-y-4 text-sm leading-relaxed text-ink-muted">
          <h2 className="font-display text-lg font-bold text-navy dark:text-ink">
            Princípios que já se aplicam
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              As informações publicadas sobre imóveis têm carácter informativo e podem ser
              alteradas ou retiradas sem aviso prévio.
            </li>
            <li>
              A utilização do site não substitui a verificação documental e legal própria de cada
              operação imobiliária.
            </li>
            <li>
              É proibido utilizar o site para fins ilícitos ou para introduzir dados falsos nos
              formulários.
            </li>
            <li>
              As marcas, imagens e conteúdos do site são propriedade da Serrote Imobiliária ou
              dos respectivos titulares.
            </li>
          </ul>

          <h2 className="mt-6 font-display text-lg font-bold text-navy dark:text-ink">
            O que ficará definido
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Âmbito do serviço e responsabilidades das partes</li>
            <li>Condições de publicação e reserva de imóveis</li>
            <li>Propriedade intelectual e licenças de uso</li>
            <li>Limitação de responsabilidade</li>
            <li>Lei aplicável e resolução de litígios</li>
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
