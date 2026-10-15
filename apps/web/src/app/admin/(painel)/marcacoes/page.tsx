import Link from "next/link";
import { AppointmentStatus } from "@serrote/domain";
import { updateAppointmentStatus } from "./actions";
import { appointmentStatusLabels } from "@/lib/labels";

export const dynamic = "force-dynamic";

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Africa/Luanda",
  }).format(date);
}

const STATUS_VALUES = Object.values(AppointmentStatus);

const statusTone: Record<AppointmentStatus, string> = {
  REQUESTED: "bg-orange/10 text-orange",
  CONFIRMED: "bg-navy/10 text-navy",
  COMPLETED: "bg-emerald-500/10 text-emerald-600",
  CANCELLED: "bg-ink-subtle/10 text-ink-muted",
  NO_SHOW: "bg-danger/10 text-danger",
};

export default async function AdminAppointmentsPage() {
  const { getPrisma } = await import("@serrote/database");
  const prisma = await getPrisma();

  const appointments = await prisma.appointment.findMany({
    orderBy: { requestedAt: "desc" },
    take: 100,
    include: {
      property: { select: { reference: true, title: true } },
      lead: { select: { name: true, phone: true, email: true } },
      assignedAgent: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-navy">
          Marcações
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {appointments.length} pedido{appointments.length === 1 ? "" : "s"} de visita.
        </p>
      </div>

      {appointments.length === 0 ? (
        <p className="rounded-card border border-line bg-canvas p-6 text-sm text-ink-muted">
          Ainda não há pedidos de visita. São criados automaticamente quando um cliente escolhe
          &ldquo;Marcar visita&rdquo; num imóvel.
        </p>
      ) : (
        <ul className="space-y-4">
          {appointments.map((appointment) => (
            <li key={appointment.id} className="rounded-card border border-line bg-canvas p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusTone[appointment.status]}`}
                    >
                      {appointmentStatusLabels[appointment.status]}
                    </span>
                    <p className="font-display text-base font-bold text-navy">
                      {appointment.lead.name}
                    </p>
                  </div>
                  <p className="text-sm text-ink-muted">
                    <a href={`tel:${appointment.lead.phone}`} className="hover:text-orange">
                      {appointment.lead.phone}
                    </a>
                    {appointment.lead.email ? (
                      <>
                        {" · "}
                        <a href={`mailto:${appointment.lead.email}`} className="hover:text-orange">
                          {appointment.lead.email}
                        </a>
                      </>
                    ) : null}
                  </p>
                  <p className="text-xs text-ink-subtle">
                    Pedido em {formatDateTime(appointment.requestedAt)}
                  </p>
                  <p className="text-sm text-ink-muted">
                    Imóvel:{" "}
                    <Link
                      href={`/admin/imoveis/${appointment.propertyId}`}
                      className="hover:text-orange"
                    >
                      {appointment.property.reference} · {appointment.property.title}
                    </Link>
                  </p>
                  {appointment.assignedAgent ? (
                    <p className="text-xs text-ink-subtle">
                      Agente: {appointment.assignedAgent.name}
                    </p>
                  ) : null}
                  {appointment.notes ? (
                    <p className="max-w-2xl pt-1 text-sm text-ink">{appointment.notes}</p>
                  ) : null}
                </div>

                <div className="flex shrink-0 flex-wrap justify-end gap-2">
                  {STATUS_VALUES.filter((status) => status !== appointment.status).map((status) => (
                    <form key={status} action={updateAppointmentStatus}>
                      <input type="hidden" name="id" value={appointment.id} />
                      <input type="hidden" name="status" value={status} />
                      <button
                        type="submit"
                        className="rounded-control border border-line-strong px-3 py-2 text-xs font-semibold text-ink-muted transition-colors hover:border-orange hover:text-orange"
                      >
                        {appointmentStatusLabels[status]}
                      </button>
                    </form>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
