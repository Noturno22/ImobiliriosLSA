import { z } from "zod";
import { RequestType } from "@serrote/domain";

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

export const leadCreateSchema = z.object({
  name: z.string().trim().min(2, "Introduza o seu nome.").max(120),
  phone: angolaPhoneSchema,
  email: z.string().trim().email("Introduza um email válido.").optional(),
  propertyId: z.string().trim().min(1).optional(),
  requestType: z.enum(enumValues(RequestType)).default(RequestType.GENERAL),
  message: z.string().trim().max(2000).optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: "É necessário consentir o contacto para continuar." }),
  }),
  // Honeypot: must remain empty; bots fill it in.
  company: z.string().max(0).optional(),
});

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
