import Link from "next/link";
import { roleLabels } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const { getPrisma } = await import("@serrote/database");
  const prisma = await getPrisma();

  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-navy">
            Utilizadores
          </h1>
          <p className="mt-1 text-sm text-ink-muted">{users.length} contas.</p>
        </div>
        <Link
          href="/admin/utilizadores/novo"
          className="inline-flex h-11 items-center justify-center rounded-control bg-orange px-6 text-sm font-semibold text-white transition-colors hover:bg-orange-hover"
        >
          Nova conta
        </Link>
      </div>

      {users.length === 0 ? (
        <p className="rounded-card border border-line bg-canvas p-6 text-sm text-ink-muted">
          Ainda não há contas de utilizador.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-line bg-canvas">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-subtle">
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Telefone</th>
                <th className="px-4 py-3 font-semibold">Papel</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((user) => (
                <tr key={user.id} className="align-top">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/utilizadores/${user.id}`}
                      className="font-medium text-ink hover:text-orange"
                    >
                      {user.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{user.email}</td>
                  <td className="px-4 py-3 text-ink-muted">{user.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-muted">{roleLabels[user.role]}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        user.active
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-danger/10 text-danger"
                      }`}
                    >
                      {user.active ? "Ativa" : "Inativa"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
