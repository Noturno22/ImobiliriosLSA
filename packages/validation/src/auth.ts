import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Introduza um email válido."),
  password: z.string().min(8, "A palavra-passe deve ter pelo menos 8 caracteres.").max(200),
});

export type LoginInput = z.infer<typeof loginSchema>;
