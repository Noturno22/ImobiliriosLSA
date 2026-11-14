import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="mx-auto grid max-w-3xl place-items-center px-4 py-24 text-center sm:px-6">
        <p className="font-display text-6xl font-extrabold text-accent">404</p>
        <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-navy dark:text-ink">
          Página não encontrada
        </h1>
        <p className="mt-2 max-w-md text-sm text-ink-muted">
          O imóvel ou a página que procura pode já não estar disponível. Explore outros imóveis ou
          fale connosco.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/imoveis"
            className="inline-flex h-11 items-center rounded-control bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Ver imóveis
          </Link>
          <Link
            href="/contacto"
            className="inline-flex h-11 items-center rounded-control border border-line-strong px-6 text-sm font-semibold text-navy transition-colors hover:border-accent hover:text-accent"
          >
            Falar connosco
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
