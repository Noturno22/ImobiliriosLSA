"use client";

import { useActionState } from "react";
import { authenticate } from "@/app/admin/login/actions";

export function LoginForm() {
  const [error, formAction, pending] = useActionState(authenticate, undefined);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1 h-11 w-full rounded-control border border-line-strong bg-canvas px-3 text-sm text-ink outline-none focus:border-accent"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-ink">
          Palavra-passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          className="mt-1 h-11 w-full rounded-control border border-line-strong bg-canvas px-3 text-sm text-ink outline-none focus:border-accent"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-control bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center rounded-control bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        {pending ? "A entrar…" : "Entrar"}
      </button>
    </form>
  );
}
