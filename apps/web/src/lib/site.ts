/**
 * Site-level configuration sourced from environment variables.
 * Never hardcode unverified company contact details here.
 */

export const site = {
  name: "Serrote Imobiliária",
  tagline: "A chave para sua nova história.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || null,
} as const;

/**
 * Builds a WhatsApp click-to-chat URL. Returns null when no verified company
 * number is configured — callers must then hide the WhatsApp action rather
 * than link to a fabricated number.
 */
export function whatsappLink(message?: string): string | null {
  if (!site.whatsappNumber) return null;
  const digits = site.whatsappNumber.replace(/\D/g, "");
  if (!digits) return null;
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${query}`;
}

/**
 * Formats a submitted lead into a readable WhatsApp message so the enquiry can
 * be delivered straight to the company's phone.
 */
export function buildLeadMessage(fields: {
  name: string;
  phone: string;
  email?: string;
  requestLabel: string;
  propertyTitle?: string;
  propertyRef?: string;
  message?: string;
}): string {
  const lines = [
    "Olá Serrote Imobiliária! Gostaria de enviar um pedido:",
    "",
    `• Nome: ${fields.name}`,
    `• Telefone: ${fields.phone}`,
  ];
  if (fields.email) lines.push(`• Email: ${fields.email}`);
  lines.push(`• Motivo: ${fields.requestLabel}`);
  if (fields.propertyTitle || fields.propertyRef) {
    const title = fields.propertyTitle ?? "Imóvel";
    const ref = fields.propertyRef ? ` (Ref. ${fields.propertyRef})` : "";
    lines.push(`• Imóvel: ${title}${ref}`);
  }
  if (fields.message) lines.push("", `Mensagem: ${fields.message}`);
  return lines.join("\n");
}

export const NAV_LINKS = [
  { href: "/imoveis", label: "Imóveis" },
  { href: "/servicos", label: "Serviços" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contacto", label: "Contacto" },
] as const;
