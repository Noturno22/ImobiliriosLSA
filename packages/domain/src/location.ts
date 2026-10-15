/**
 * Angola location data.
 *
 * NOTE (data dependency): the province list below reflects the long-standing
 * 18-province division. Angola's 2024 territorial reform introduced additional
 * provinces (e.g. Icolo e Bengo, Cuando, Cubango). This MUST be confirmed with
 * the business before being treated as authoritative. Municipalities are seeded
 * for the launch market (Luanda) only.
 */

export interface Municipality {
  name: string;
  slug: string;
}

export interface Province {
  name: string;
  slug: string;
  municipalities?: readonly Municipality[];
}

const m = (name: string, slug: string): Municipality => ({ name, slug });

export const LUANDA_MUNICIPALITIES: readonly Municipality[] = [
  m("Luanda", "luanda"),
  m("Belas", "belas"),
  m("Cacuaco", "cacuaco"),
  m("Cazenga", "cazenga"),
  m("Talatona", "talatona"),
  m("Viana", "viana"),
  m("Kilamba Kiaxi", "kilamba-kiaxi"),
];

export const PROVINCES: readonly Province[] = [
  { name: "Bengo", slug: "bengo" },
  { name: "Benguela", slug: "benguela" },
  { name: "Bié", slug: "bie" },
  { name: "Cabinda", slug: "cabinda" },
  { name: "Cuando Cubango", slug: "cuando-cubango" },
  { name: "Cuanza Norte", slug: "cuanza-norte" },
  { name: "Cuanza Sul", slug: "cuanza-sul" },
  { name: "Cunene", slug: "cunene" },
  { name: "Huambo", slug: "huambo" },
  { name: "Huíla", slug: "huila" },
  { name: "Luanda", slug: "luanda", municipalities: LUANDA_MUNICIPALITIES },
  { name: "Lunda Norte", slug: "lunda-norte" },
  { name: "Lunda Sul", slug: "lunda-sul" },
  { name: "Malanje", slug: "malanje" },
  { name: "Moxico", slug: "moxico" },
  { name: "Namibe", slug: "namibe" },
  { name: "Uíge", slug: "uige" },
  { name: "Zaire", slug: "zaire" },
];

/** Business timezone for all business-facing date/time presentation. */
export const BUSINESS_TIMEZONE = "Africa/Luanda" as const;
