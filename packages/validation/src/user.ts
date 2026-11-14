import { z } from "zod";
import { Role } from "@regis/domain";

const enumValues = <T extends Record<string, string>>(e: T) =>
  Object.values(e) as [string, ...string[]];

/** Admin form for creating or editing a team member. */
export const userFormSchema = z.object({
  name: z.string().trim().min(2, "Introduza o nome.").max(120),
  email: z.string().trim().email("Introduza um email válido."),
  phone: z.string().trim().max(30).optional(),
  role: z.enum(enumValues(Role)),
  active: z.boolean().default(true),
  /** Required on create; optional on update (blank keeps the current password). */
  password: z
    .string()
    .min(8, "A palavra-passe deve ter pelo menos 8 caracteres.")
    .max(200)
    .optional(),
});

export type UserFormInput = z.infer<typeof userFormSchema>;
