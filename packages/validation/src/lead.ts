import { z } from "zod";
import { RequestType } from "@regis/domain";

const enumValues = <T extends Record<string, string>>(e: T) =>
  Object.values(e) as [string, ...string[]];

/**
 * Angolan phone numbers: +244 followed by a 9-digit mobile (starting 9) or
 * landline. Accepts spaces, dashes and an optional +244 country code.
 */
export const angolaPhoneSchema = z
  .string()
  .trim()
  .transform((raw) => raw.replace(/[\s\-().]/g, ""))
  .refine((v) => /^(\+?244)?9\d{8}$/.test(v) || /^(\+?244)2\d{7}$/.test(v), {
    message: "Introduza um número de telefone angolano válido (ex.: +244 923 000 000).",
  })
  .transform((v) => {
    const digits = v.replace(/^\+?244/, "");
    return `+244${digits}`;
  });

/** Empty strings from HTML inputs are normalised to `undefined`. */
const optionalDateField = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" ? undefined : value))
  .pipe(
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "Indique a data da visita no formato AAAA-MM-DD (ex.: 2026-10-20).",
      })
      .optional(),
  );

const optionalTimeField = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" ? undefined : value))
  .pipe(
    z
      .string()
      .regex(/^\d{2}:\d{2}$/, { message: "Indique a hora da visita (ex.: 15:30)." })
      .optional(),
  );

/**
 * Combines the preferred date + time into an absolute Date anchored to Angola
 * (UTC+1, no daylight saving). Returns null when either part is missing or the
 * combination is not a real moment.
 */
export function parsePreferredDateTime(date?: string, time?: string): Date | null {
  if (!date || !time) return null;
  const at = new Date(`${date}T${time}:00+01:00`);
  return Number.isNaN(at.getTime()) ? null : at;
}

export const leadCreateSchema = z
  .object({
    name: z.string().trim().min(2, "Introduza o seu nome.").max(120),
    phone: angolaPhoneSchema,
    email: z.string().trim().email("Introduza um email válido.").optional(),
    propertyId: z.string().trim().min(1).optional(),
    requestType: z.enum(enumValues(RequestType)).default(RequestType.GENERAL),
    message: z.string().trim().max(2000).optional(),
    preferredDate: optionalDateField,
    preferredTime: optionalTimeField,
    consent: z.literal(true, {
      errorMap: () => ({ message: "É necessário consentir o contacto para continuar." }),
    }),
    // Honeypot: must remain empty; bots fill it in.
    company: z.string().max(0).optional(),
  })
  .refine((value) => (!value.preferredDate && !value.preferredTime) || (value.preferredDate && value.preferredTime), {
    message: "Para marcar uma visita indique a data e a hora pretendidas.",
    path: ["preferredDate"],
  })
  .refine(
    (value) => {
      const at = parsePreferredDateTime(value.preferredDate, value.preferredTime);
      return at === null || at.getTime() > Date.now();
    },
    { message: "A data da visita tem de ser futura.", path: ["preferredDate"] },
  );

export const appointmentCreateSchema = z.object({
  propertyId: z.string().trim().min(1),
  leadId: z.string().trim().min(1).optional(),
  name: z.string().trim().min(2).max(120),
  phone: angolaPhoneSchema,
  email: z.string().trim().email().optional(),
  requestedAt: z.string().datetime({ offset: true }),
  timezone: z.string().default("Africa/Luanda"),
  notes: z.string().trim().max(1000).optional(),
  consent: z.literal(true),
});

export type LeadCreateInput = z.infer<typeof leadCreateSchema>;
export type AppointmentCreateInput = z.infer<typeof appointmentCreateSchema>;
