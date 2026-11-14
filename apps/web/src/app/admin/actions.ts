"use server";

import { revalidatePath } from "next/cache";
import { LeadStatus, Permission, hasPermission } from "@regis/domain";
import { auth, signOut } from "@/auth";

export async function doSignOut(): Promise<void> {
  await signOut({ redirectTo: "/admin/login" });
}

/**
 * Updates a lead's status. Authorization is enforced server-side: the session
 * must carry a role permitted to write leads, and the target status must be a
 * valid enum value — the client cannot escalate either.
 */
export async function updateLeadStatus(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Sessão inválida.");

  if (!hasPermission(session.user.role, Permission.LEAD_WRITE)) {
    throw new Error("Sem permissão para atualizar leads.");
  }

  const id = String(formData.get("leadId") ?? "");
  const status = String(formData.get("status") ?? "");
  const validStatuses = Object.values(LeadStatus) as string[];
  if (!id || !validStatuses.includes(status)) return;

  const { getPrisma } = await import("@regis/database");
  const prisma = await getPrisma();

  await prisma.lead.update({
    where: { id },
    data: { status: status as LeadStatus },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "lead.status.update",
      entity: "Lead",
      entityId: id,
      metadata: { status },
    },
  });

  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}
