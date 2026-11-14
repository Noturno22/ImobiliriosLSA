import { AMENITIES } from "@regis/domain";
import type {
  AppointmentStatus,
  LeadSource,
  LeadStatus,
  PropertyStatus,
  PropertyType,
  RequestType,
  Role,
  TransactionType,
} from "@regis/domain";

/** Portuguese (pt-PT) labels. Centralised so future i18n can replace them. */
export const transactionLabels: Record<TransactionType, string> = {
  SALE: "Venda",
  RENT: "Arrendamento",
};

export const requestTypeLabels: Record<RequestType, string> = {
  GENERAL: "Informação geral",
  PROPERTY_INFO: "Informação sobre um imóvel",
  VIEWING: "Marcar visita",
  CALLBACK: "Pedido de contacto",
  VALUATION: "Avaliação de imóvel",
};

export const statusLabels: Record<PropertyStatus, string> = {
  DRAFT: "Rascunho",
  PUBLISHED: "Disponível",
  RESERVED: "Reservado",
  SOLD: "Vendido",
  RENTED: "Arrendado",
  ARCHIVED: "Arquivado",
};

/** Human label for an amenity key, falling back to a title-cased version of it. */
export function formatAmenityLabel(key: string): string {
  const known = AMENITIES.find((a) => a.key === key);
  if (known) return known.label;
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export const propertyTypeLabels: Record<PropertyType, string> = {
  HOUSE: "Moradia",
  VILLA: "Villa",
  APARTMENT: "Apartamento",
  LAND: "Terreno",
  COMMERCIAL: "Comercial",
  OFFICE: "Escritório",
  WAREHOUSE: "Armazém",
};

export function formatArea(areaM2: number | null | undefined): string | null {
  if (!areaM2) return null;
  return `${new Intl.NumberFormat("pt-AO", { maximumFractionDigits: 0 }).format(areaM2)} m²`;
}

export const leadStatusLabels: Record<LeadStatus, string> = {
  NEW: "Novo",
  CONTACTED: "Contactado",
  QUALIFIED: "Qualificado",
  VISIT_SCHEDULED: "Visita marcada",
  WON: "Ganho",
  LOST: "Perdido",
};

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  REQUESTED: "Pedido",
  CONFIRMED: "Confirmada",
  COMPLETED: "Realizada",
  CANCELLED: "Cancelada",
  NO_SHOW: "Não compareceu",
};

export const leadSourceLabels: Record<LeadSource, string> = {
  WEBSITE: "Website",
  MOBILE_APP: "Aplicação móvel",
  WHATSAPP: "WhatsApp",
  PHONE: "Telefone",
  EMAIL: "Email",
  WALK_IN: "Presencial",
};

export const roleLabels: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrador",
  PROPERTY_MANAGER: "Gestor de imóveis",
  AGENT: "Agente",
  EDITOR: "Editor",
};
