import Image from "next/image";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user) redirect("/admin");

  return (
    <main className="grid min-h-dvh place-items-center bg-canvas-soft px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center">
          <Image
            src="/brand/logo.png"
            alt="Regis Properties"
            width={1498}
            height={935}
            className="h-14 w-auto"
          />
        </div>

        <div className="rounded-card border border-line bg-canvas p-6 shadow-card">
          <h1 className="font-display text-lg font-bold text-navy">Área reservada</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Inicie sessão para gerir imóveis e pedidos.
          </p>
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-ink-subtle">
          Acesso restrito à equipa da Regis Properties.
        </p>
      </div>
    </main>
  );
}
