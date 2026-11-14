"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Role } from "@regis/domain";
import { roleLabels } from "@/lib/labels";
import { saveUser, type UserFormState } from "@/app/admin/(painel)/utilizadores/actions";

export interface UserFormValues {
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  active: boolean;
}

const EMPTY: UserFormValues = {
  name: "",
  email: "",
  phone: "",
  role: "AGENT",
  active: true,
};

const inputClass =
  "mt-1 h-11 w-full rounded-control border border-line-strong bg-canvas px-3 text-sm text-ink outline-none focus:border-accent";
const labelClass = "block text-sm font-medium text-ink";

function FieldError({ messages }: { messages?: string[] | undefined }) {
  const first = messages?.[0];
  if (!first) return null;
  return <p className="mt-1 text-xs text-danger">{first}</p>;
}

export function UserForm({ values }: { values?: UserFormValues }) {
  const initial = values ?? EMPTY;
  const editing = Boolean(initial.id);
  const [state, formAction, pending] = useActionState<UserFormState, FormData>(saveUser, {});
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-8">
      {editing ? <input type="hidden" name="id" value={initial.id} /> : null}

      {state.error ? (
        <p role="alert" className="rounded-control bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <section className="rounded-card border border-line bg-canvas p-5">
        <h2 className="font-display text-base font-bold text-navy">Conta</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className={labelClass}>
              Nome
            </label>
            <input id="name" name="name" defaultValue={initial.name} className={inputClass} />
            <FieldError messages={errors.name} />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={initial.email}
              className={inputClass}
            />
            <FieldError messages={errors.email} />
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>
              Telefone (opcional)
            </label>
            <input id="phone" name="phone" defaultValue={initial.phone} className={inputClass} />
          </div>
          <div>
            <label htmlFor="role" className={labelClass}>
              Papel
            </label>
            <select id="role" name="role" defaultValue={initial.role} className={inputClass}>
              {Object.values(Role).map((value) => (
                <option key={value} value={value}>
                  {roleLabels[value]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm font-medium text-ink">
              <input
                type="checkbox"
                name="active"
                defaultChecked={initial.active}
                className="size-4 rounded border-line-strong"
              />
              Conta ativa
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-card border border-line bg-canvas p-5">
        <h2 className="font-display text-base font-bold text-navy">Palavra-passe</h2>
        <div className="mt-4 max-w-sm">
          <label htmlFor="password" className={labelClass}>
            {editing ? "Nova palavra-passe (opcional)" : "Palavra-passe"}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required={!editing}
            className={inputClass}
          />
          <FieldError messages={errors.password} />
          {editing ? (
            <p className="mt-1 text-xs text-ink-muted">
              Deixe em branco para manter a palavra-passe atual.
            </p>
          ) : null}
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center rounded-control bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "A guardar…" : editing ? "Guardar alterações" : "Criar conta"}
        </button>
        <Link
          href="/admin/utilizadores"
          className="inline-flex h-11 items-center justify-center rounded-control border border-line-strong px-6 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
