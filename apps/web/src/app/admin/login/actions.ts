"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

/**
 * Credentials sign-in as a form action. Returns a user-facing message on an
 * authentication error; re-throws redirects and unexpected errors so Next.js
 * can handle them.
 */
export async function authenticate(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Credenciais inválidas. Verifique o email e a palavra-passe.";
    }
    throw error;
  }
  return undefined;
}
