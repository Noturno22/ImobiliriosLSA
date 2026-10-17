"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { Permission, hasPermission } from "@serrote/domain";
import type { Role } from "@serrote/domain";
import { userFormSchema } from "@serrote/validation";
import { auth } from "@/auth";

export interface UserFormState {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

function str(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Creates or edits a team member. Blank password on edit keeps the current hash. */
export async function saveUser(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const session = await auth();
  if (!session?.user) throw new Error("Sessão inválida.");
  if (!hasPermission(session.user.role, Permission.USER_MANAGE)) {
    return { error: "Não tem permissão para gerir utilizadores." };
  }

  const id = str(formData.get("id"));
  const creating = id === "";
  const rawPassword = str(formData.get("password"));

  const parsed = userFormSchema.safeParse({
    name: str(formData.get("name")),
    email: str(formData.get("email")),
    phone: str(formData.get("phone")) || undefined,
    role: str(formData.get("role")),
    active: formData.get("active") === "on",
    password: rawPassword || undefined,
  });

  if (!parsed.success) {
    return {
      error: "Verifique os campos assinalados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  if (creating && !data.password) {
    return { error: "A palavra-passe é obrigatória para criar uma conta." };
  }

  const { getPrisma } = await import("@serrote/database");
  const prisma = await getPrisma();

  const taken = await prisma.user.findUnique({
    where: { email: data.email },
    select: { id: true },
  });
  if (taken && taken.id !== id) {
    return { error: "Já existe uma conta com este email." };
  }

  const role = data.role as Role;
  const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : undefined;

  try {
    if (creating) {
      await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone ?? null,
          role,
          active: data.active,
          passwordHash,
        },
      });
    } else {
      await prisma.user.update({
        where: { id },
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone ?? null,
          role,
          active: data.active,
          ...(passwordHash ? { passwordHash } : {}),
        },
      });
    }
  } catch (error) {
    console.error("[admin] saveUser failed:", error);
    return { error: "Não foi possível guardar o utilizador. Tente novamente." };
  }

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: creating ? "user.create" : "user.update",
      entity: "User",
      entityId: id || null,
      metadata: { email: data.email, role, active: data.active },
    },
  });

  revalidatePath("/admin/utilizadores");
  revalidatePath("/admin");
  redirect("/admin/utilizadores");
}
