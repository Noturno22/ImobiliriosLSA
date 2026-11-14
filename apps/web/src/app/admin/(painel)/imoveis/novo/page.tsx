import Link from "next/link";
import { PropertyForm } from "@/components/admin/property-form";

export const dynamic = "force-dynamic";

export default function NewPropertyPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/imoveis" className="text-sm text-ink-muted hover:text-accent">
          ← Imóveis
        </Link>
        <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-navy">
          Novo imóvel
        </h1>
      </div>
      <PropertyForm />
    </div>
  );
}
