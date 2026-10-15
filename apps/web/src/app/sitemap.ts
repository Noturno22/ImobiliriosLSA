import type { MetadataRoute } from "next";
import { getPublishedPropertySlugs } from "@/lib/properties";

// Regenerate on request so database-backed listings are reflected.
export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const STATIC_ROUTES: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/imoveis", priority: 0.9 },
  { path: "/servicos", priority: 0.7 },
  { path: "/sobre", priority: 0.6 },
  { path: "/contacto", priority: 0.7 },
  { path: "/politica-de-privacidade", priority: 0.2 },
  { path: "/termos", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route.priority,
  }));

  const properties = await getPublishedPropertySlugs();
  const propertyEntries: MetadataRoute.Sitemap = properties.map((property) => ({
    url: `${siteUrl}/imoveis/${property.slug}`,
    lastModified: property.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...propertyEntries];
}
