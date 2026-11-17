import Image from "next/image";
import Link from "next/link";
import { NAV_LINKS, site, whatsappLink } from "@/lib/site";

export function SiteFooter() {
  const wa = whatsappLink("Olá! Gostaria de falar com a Regis Properties.");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-line bg-canvas-soft">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
      <Image
        src="/brand/logo.png"
        alt="Regis Properties"
            width={1498}
            height={935}
            className="h-16 w-auto sm:h-24"
          />
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
            {site.tagline} Casas, apartamentos e terrenos em Angola — compra, venda,
            arrendamento e consultoria imobiliária.
          </p>
          {wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-control bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              Falar no WhatsApp
            </a>
          ) : (
            <p className="mt-5 text-xs text-ink-subtle">
              Contacto por WhatsApp disponível após configuração do número oficial.
            </p>
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-ink">Navegação</h2>
          <ul className="mt-4 space-y-2.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-ink-muted hover:text-ink">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-ink">Serviços</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
            <li>Compra e venda</li>
            <li>Arrendamento</li>
            <li>Gestão imobiliária</li>
            <li>Consultoria imobiliária</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-ink-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {year} Regis Properties. Todos os direitos reservados.</p>
          <div className="flex gap-5">
            <Link href="/politica-de-privacidade" className="hover:text-ink">
              Política de Privacidade
            </Link>
            <Link href="/termos" className="hover:text-ink">
              Termos de Utilização
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
