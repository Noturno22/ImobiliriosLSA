"use client";

import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto grid min-h-dvh max-w-2xl place-items-center px-4 py-24 text-center sm:px-6">
      <div>
        <p className="font-display text-6xl font-extrabold text-accent">Erro</p>
        <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-navy dark:text-ink">
          Algo não correu como esperado
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Ocorreu um problema ao carregar esta página. Pode tentar novamente — se o erro persistir,
          fale connosco.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-11 items-center justify-center rounded-control bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-control border border-line-strong px-6 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
          >
            Voltar ao início
          </Link>
        </div>
        {error.digest ? (
          <p className="mt-6 text-xs text-ink-subtle">Referência: {error.digest}</p>
        ) : null}
      </div>
    </main>
  );
}
