"use server";

import { revalidatePath } from "next/cache";
import { AppointmentStatus, Permission, hasPermission } from "@serrote/domain";
import { auth } from "@/auth";

/** Updates a viewing appointment's status (confirm, complete, cancel …). */
export async function updateAppointmentStatus(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Sessão inválida.");
  if (!hasPermission(session.user.role, Permission.APPOINTMENT_WRITE)) {
    throw new Error("Sem permissão para gerir marcações.");
  }

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !(Object.values(AppointmentStatus) as string[]).includes(status)) return;

  const { getPrisma } = await import("@serrote/database");
  const prisma = await getPrisma();

  await prisma.appointment.update({
    where: { id },
    data: { status: status as AppointmentStatus },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "appointment.status.update",
      entity: "Appointment",
      entityId: id,
      metadata: { status },
    },
  });

  revalidatePath("/admin/marcacoes");
  revalidatePath("/admin");
}
