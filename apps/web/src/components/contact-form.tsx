"use client";

import { useState } from "react";
import { todayISO } from "@/lib/dates";

const REQUEST_TYPE_LABELS: Record<string, string> = {
  GENERAL: "Informação geral",
  PROPERTY_INFO: "Informação sobre um imóvel",
  VIEWING: "Marcar visita",
  CALLBACK: "Pedido de contacto",
  VALUATION: "Avaliação de imóvel",
};

const fieldClass =
  "h-11 w-full rounded-control border border-line bg-canvas px-3 text-sm text-ink outline-none transition-colors focus:border-accent";
const labelClass = "flex flex-col gap-1.5 text-xs font-semibold text-ink-muted";

type Status = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [requestType, setRequestType] = useState<string>("GENERAL");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);

    const payload = {
      name: String(fd.get("name") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim() || undefined,
      requestType,
      message: String(fd.get("message") ?? "").trim() || undefined,
      preferredDate: String(fd.get("preferredDate") ?? "").trim() || undefined,
      preferredTime: String(fd.get("preferredTime") ?? "").trim() || undefined,
      consent: fd.get("consent") === "on",
      company: String(fd.get("sr_hp") ?? ""),
    };

    setStatus("loading");
    setError(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };

      if (res.ok && json.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
        setError(json.error ?? "Não foi possível enviar. Verifique os dados e tente novamente.");
      }
    } catch {
      setStatus("error");
      setError("Falha de ligação. Verifique a sua internet e tente novamente.");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-card border border-success/30 bg-success/10 p-8 text-center"
      >
        <p className="font-display text-lg font-bold text-navy dark:text-ink">
          Pedido enviado com sucesso
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
          Recebemos o seu pedido e a nossa equipa entrará em contacto consigo.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-5 inline-flex h-10 items-center rounded-control border border-line px-5 text-sm font-semibold text-ink hover:border-line-strong"
        >
          Enviar outro pedido
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-card border border-line bg-canvas p-5 shadow-card sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Nome <span className="text-accent" aria-hidden>*</span>
          <input
            type="text"
            name="name"
            required
            minLength={2}
            autoComplete="name"
            placeholder="O seu nome"
            className={fieldClass}
          />
        </label>

        <label className={labelClass}>
          Telefone <span className="text-accent" aria-hidden>*</span>
          <input
            type="tel"
            name="phone"
            required
            autoComplete="tel"
            placeholder="+244 900 000 000"
            className={fieldClass}
          />
        </label>

        <label className={labelClass}>
          Email (opcional)
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="nome@exemplo.com"
            className={fieldClass}
          />
        </label>

        <label className={labelClass}>
          Tipo de pedido
          <select
            name="requestType"
            value={requestType}
            onChange={(event) => setRequestType(event.target.value)}
            className={fieldClass}
          >
            {Object.entries(REQUEST_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        {requestType === "VIEWING" && (
          <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
            <label className={labelClass}>
              Data da visita (opcional)
              <input type="date" name="preferredDate" min={todayISO()} className={fieldClass} />
            </label>
            <label className={labelClass}>
              Hora pretendida (opcional)
              <input type="time" name="preferredTime" step={1800} className={fieldClass} />
            </label>
          </div>
        )}

        <label className={`${labelClass} sm:col-span-2`}>
          Mensagem (opcional)
          <textarea
            name="message"
            rows={4}
            maxLength={2000}
            placeholder="Como podemos ajudar?"
            className="w-full rounded-control border border-line bg-canvas px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent"
          />
        </label>
      </div>

      {/* Honeypot — hidden from humans, catches automated bots */}
      <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden>
        <input
          type="text"
          name="sr_hp"
          tabIndex={-1}
          autoComplete="off"
          data-lpignore="true"
          data-1p-ignore="true"
        />
      </div>

      <label className="mt-4 flex items-start gap-3 text-sm text-ink-muted">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-0.5 size-4 shrink-0 accent-accent"
        />
        <span>
          Autorizo o contacto da Regis Properties para resposta ao meu pedido, de acordo com a{" "}
          <a href="/politica-de-privacidade" className="font-semibold text-accent hover:underline">
            Política de Privacidade
          </a>
          .
        </span>
      </label>

      {status === "error" && error && (
        <p role="alert" className="mt-4 rounded-control bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-control bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "loading" ? "A enviar…" : "Enviar pedido"}
      </button>
    </form>
  );
}
