import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { doSignOut } from "@/app/admin/actions";

const NAV = [
  { href: "/admin", label: "Painel" },
  { href: "/admin/imoveis", label: "Imóveis" },
  { href: "/admin/leads", label: "Leads" },
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="min-h-dvh bg-canvas-soft">
      <header className="border-b border-line bg-canvas">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-display text-lg font-extrabold tracking-tight text-navy">
              Serrote Admin
            </Link>
            <nav className="flex gap-5 text-sm">
              {NAV.map((link) => (
                <Link key={link.href} href={link.href} className="text-ink-muted hover:text-ink">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-ink-subtle sm:block">{session.user.email}</span>
            <form action={doSignOut}>
              <button
                type="submit"
                className="rounded-control border border-line-strong px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-orange hover:text-orange"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
