"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_ITEMS = [
  { href: "/", label: "Início" },
  { href: "/imoveis", label: "Imóveis" },
  { href: "/servicos", label: "Serviços" },
  { href: "/sobre", label: "Sobre nós" },
  { href: "/contacto", label: "Contacto" },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.2-3.2" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      {open ? (
        <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
      )}
    </svg>
  );
}

/**
 * Site chrome. When `overlay` is set the header floats over a full-bleed hero
 * (home page); otherwise it stays in flow so inner pages are not covered.
 */
export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header
      className={
        overlay
          ? "absolute inset-x-0 top-0 z-50 bg-[linear-gradient(to_bottom,rgba(250,246,238,0.92),rgba(250,246,238,0))] dark:bg-[linear-gradient(to_bottom,rgba(11,13,15,0.92),rgba(11,13,15,0))]"
          : "sticky top-0 z-50 border-b border-line bg-canvas/95 backdrop-blur"
      }
    >
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:inline-flex focus:h-11 focus:items-center focus:rounded-control focus:border focus:border-line focus:bg-canvas focus:px-4 focus:text-sm focus:font-semibold focus:text-ink"
      >
        Saltar para o conteúdo
      </a>

      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Serrote Imobiliária — início">
          <Image
            src="/brand/logo-mark.png"
            alt=""
            width={1391}
            height={984}
            priority
            className="h-12 w-auto sm:h-16"
          />
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-extrabold tracking-tight text-navy sm:text-2xl">
              SERROTE IMOBILIÁRIA
            </span>
            <span className="mt-0.5 hidden text-[0.65rem] font-medium tracking-[0.16em] text-ink-muted sm:block">
              A chave para a sua nova história
            </span>
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative rounded-control px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "text-orange" : "text-ink hover:text-orange"
                }`}
              >
                {item.label}
                {active && (
                  <span aria-hidden className="absolute inset-x-3 bottom-1 h-[3px] rounded-full bg-orange" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/imoveis"
            aria-label="Pesquisar imóveis"
            className="grid size-10 place-items-center rounded-full border border-line-strong bg-canvas/70 text-ink transition-colors hover:border-orange hover:text-orange"
          >
            <SearchIcon />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-nav-drawer"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            className="grid size-10 place-items-center rounded-full border border-line-strong bg-canvas/70 text-ink transition-colors hover:border-orange hover:text-orange"
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="site-nav-drawer"
          aria-label="Principal (menu)"
          className="border-t border-line bg-canvas px-4 pb-4 pt-2"
        >
          <ul className="flex flex-col">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-control px-3 py-3 text-base font-medium transition-colors ${
                      active ? "bg-orange-soft text-orange" : "text-ink hover:bg-canvas-soft"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href="/contacto"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-control bg-orange px-4 py-3 text-center text-sm font-semibold text-white"
          >
            Fale connosco
          </Link>
        </nav>
      )}
    </header>
  );
}
