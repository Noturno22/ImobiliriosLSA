import Link from "next/link";
import { formatMoney } from "@regis/domain";
import { propertyTypeLabels, statusLabels, transactionLabels } from "@/lib/labels";

export const dynamic = "force-dynamic";

function money(minor: bigint, currency: "AOA" | "USD" | "EUR"): string {
  return formatMoney({ amountMinor: Number(minor), currency });
}

export default async function AdminPropertiesPage() {
  const { getPrisma } = await import("@regis/database");
  const prisma = await getPrisma();

  const properties = await prisma.property.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-navy">Imóveis</h1>
          <p className="mt-1 text-sm text-ink-muted">{properties.length} registos.</p>
        </div>
        <Link
          href="/admin/imoveis/novo"
          className="inline-flex h-11 items-center justify-center rounded-control bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          Novo imóvel
        </Link>
      </div>

      {properties.length === 0 ? (
        <p className="rounded-card border border-line bg-canvas p-6 text-sm text-ink-muted">
          Ainda não há imóveis registados.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-line bg-canvas">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-subtle">
                <th className="px-4 py-3 font-semibold">Referência</th>
                <th className="px-4 py-3 font-semibold">Título</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Localização</th>
                <th className="px-4 py-3 font-semibold">Preço</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {properties.map((property) => (
                <tr key={property.id} className="align-top">
                  <td className="px-4 py-3 font-mono text-xs text-ink-muted">{property.reference}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/imoveis/${property.id}`}
                      className="font-medium text-ink hover:text-accent"
                    >
                      {property.title}
                    </Link>
                    {property.featured ? (
                      <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
                        Destaque
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {transactionLabels[property.transactionType]} · {propertyTypeLabels[property.propertyType]}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {property.municipality}, {property.province}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-navy">
                    {money(property.priceAmountMinor, property.priceCurrency)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-canvas-soft px-2 py-0.5 text-xs font-semibold text-ink-muted">
                      {statusLabels[property.status]}
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
