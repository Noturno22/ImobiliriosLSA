import Link from "next/link";
import { formatMoney } from "@serrote/domain";
import { leadStatusLabels, statusLabels, transactionLabels } from "@/lib/labels";

export const dynamic = "force-dynamic";

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Africa/Luanda",
  }).format(date);
}

export default async function AdminDashboardPage() {
  const { getPrisma } = await import("@serrote/database");
  const prisma = await getPrisma();

  const [published, drafts, totalLeads, newLeads, pendingAppointments, recentLeads, recentProperties] =
    await Promise.all([
      prisma.property.count({ where: { status: "PUBLISHED" } }),
      prisma.property.count({ where: { status: "DRAFT" } }),
      prisma.lead.count(),
      prisma.lead.count({ where: { status: "NEW" } }),
      prisma.appointment.count({ where: { status: "REQUESTED" } }),
      prisma.lead.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { property: { select: { reference: true, title: true } } },
      }),
      prisma.property.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
    ]);

  const stats = [
    { label: "Imóveis disponíveis", value: published, href: "/admin/imoveis" },
    { label: "Rascunhos", value: drafts, href: "/admin/imoveis" },
    { label: "Leads no total", value: totalLeads, href: "/admin/leads" },
    { label: "Leads novos", value: newLeads, href: "/admin/leads" },
    { label: "Visitas pedidas", value: pendingAppointments, href: "/admin/leads" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-navy">Painel</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Visão geral do portefólio e dos pedidos recebidos.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-card border border-line bg-canvas p-4 transition-colors hover:border-orange"
          >
            <span className="block font-display text-3xl font-extrabold text-navy">{stat.value}</span>
            <span className="mt-1 block text-xs text-ink-muted">{stat.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-card border border-line bg-canvas p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-navy">Leads recentes</h2>
            <Link href="/admin/leads" className="text-sm font-semibold text-orange hover:underline">
              Ver todos
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">Ainda não há pedidos.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {recentLeads.map((lead) => (
                <li key={lead.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{lead.name}</p>
                    <p className="truncate text-xs text-ink-muted">
                      {lead.property ? `${lead.property.reference} · ${lead.property.title}` : lead.phone}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="block text-xs font-semibold text-navy">
                      {leadStatusLabels[lead.status]}
                    </span>
                    <span className="text-[11px] text-ink-subtle">{formatDateTime(lead.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-card border border-line bg-canvas p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-navy">Imóveis recentes</h2>
            <Link href="/admin/imoveis" className="text-sm font-semibold text-orange hover:underline">
              Ver todos
            </Link>
          </div>

          {recentProperties.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">Ainda não há imóveis.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {recentProperties.map((property) => (
                <li key={property.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{property.title}</p>
                    <p className="text-xs text-ink-muted">
                      {property.reference} · {transactionLabels[property.transactionType]}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="block text-xs font-semibold text-navy">
                      {formatMoney({
                        amountMinor: Number(property.priceAmountMinor),
                        currency: property.priceCurrency,
                      })}
                    </span>
                    <span className="text-[11px] text-ink-subtle">{statusLabels[property.status]}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
