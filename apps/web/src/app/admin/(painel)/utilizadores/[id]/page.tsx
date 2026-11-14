import Link from "next/link";
import { notFound } from "next/navigation";
import { Role } from "@regis/domain";
import { UserForm, type UserFormValues } from "@/components/admin/user-form";
import { roleLabels } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { getPrisma } = await import("@regis/database");
  const prisma = await getPrisma();

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) notFound();

  const values: UserFormValues = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    role: user.role as Role,
    active: user.active,
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/utilizadores" className="text-sm text-ink-muted hover:text-accent">
          ← Utilizadores
        </Link>
        <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-navy">
          {user.name}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {roleLabels[user.role]} ·{" "}
          <span className={user.active ? "text-emerald-600" : "text-ink-subtle"}>
            {user.active ? "Conta ativa" : "Conta inativa"}
          </span>
        </p>
      </div>

      <UserForm values={values} />
    </div>
  );
}
