import { LeadStatus } from "@serrote/domain";
import { updateLeadStatus } from "@/app/admin/actions";
import { leadSourceLabels, leadStatusLabels, requestTypeLabels } from "@/lib/labels";

export const dynamic = "force-dynamic";

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Africa/Luanda",
  }).format(date);
}

const STATUS_VALUES = Object.values(LeadStatus);

export default async function AdminLeadsPage() {
  const { getPrisma } = await import("@serrote/database");
  const prisma = await getPrisma();

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { property: { select: { reference: true, title: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-navy">Leads</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {leads.length} pedido{leads.length === 1 ? "" : "s"} mais recente{leads.length === 1 ? "" : "s"}.
        </p>
      </div>

      {leads.length === 0 ? (
        <p className="rounded-card border border-line bg-canvas p-6 text-sm text-ink-muted">
          Ainda não há pedidos recebidos.
        </p>
      ) : (
        <ul className="space-y-4">
          {leads.map((lead) => (
            <li key={lead.id} className="rounded-card border border-line bg-canvas p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <p className="font-display text-base font-bold text-navy">{lead.name}</p>
                  <p className="text-sm text-ink-muted">
                    <a href={`tel:${lead.phone}`} className="hover:text-orange">
                      {lead.phone}
                    </a>
                    {lead.email ? (
                      <>
                        {" · "}
                        <a href={`mailto:${lead.email}`} className="hover:text-orange">
                          {lead.email}
                        </a>
                      </>
                    ) : null}
                  </p>
                  <p className="text-xs text-ink-subtle">
                    {requestTypeLabels[lead.requestType]} · {leadSourceLabels[lead.source]} ·{" "}
                    {formatDateTime(lead.createdAt)}
                  </p>
                  {lead.property ? (
                    <p className="text-xs text-ink-muted">
                      Imóvel: {lead.property.reference} · {lead.property.title}
                    </p>
                  ) : null}
                  {lead.message ? (
                    <p className="max-w-2xl pt-1 text-sm text-ink">{lead.message}</p>
                  ) : null}
                </div>

                <div className="shrink-0">
                  <form action={updateLeadStatus} className="flex items-center gap-2">
                    <input type="hidden" name="leadId" value={lead.id} />
                    <label htmlFor={`status-${lead.id}`} className="sr-only">
                      Estado do lead
                    </label>
                    <select
                      id={`status-${lead.id}`}
                      name="status"
                      defaultValue={lead.status}
                      className="h-10 rounded-control border border-line-strong bg-canvas px-3 text-sm text-ink outline-none focus:border-orange"
                    >
                      {STATUS_VALUES.map((value) => (
                        <option key={value} value={value}>
                          {leadStatusLabels[value]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="h-10 rounded-control bg-orange px-4 text-sm font-semibold text-white transition-colors hover:bg-orange-hover"
                    >
                      Guardar
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
