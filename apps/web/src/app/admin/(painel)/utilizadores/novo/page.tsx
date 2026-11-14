import Link from "next/link";
import { UserForm } from "@/components/admin/user-form";

export const dynamic = "force-dynamic";

export default function NewUserPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/utilizadores" className="text-sm text-ink-muted hover:text-accent">
          ← Utilizadores
        </Link>
        <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-navy">
          Nova conta
        </h1>
      </div>
      <UserForm />
    </div>
  );
}
