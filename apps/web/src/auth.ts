import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { loginSchema } from "@serrote/validation";
import type { Role } from "@serrote/domain";

/**
 * Auth.js (NextAuth v5) configuration for the administrative area.
 *
 * Credentials only, JWT sessions — no OAuth, so no database adapter is needed;
 * accounts are looked up in our own `User` table and verified with bcrypt.
 * Authorization is enforced server-side (see the protected /admin layout).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      name: "Credenciais",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Palavra-passe", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { getPrisma } = await import("@serrote/database");
        const prisma = await getPrisma();
        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
        if (!user || !user.active || !user.passwordHash) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string | undefined) ?? "";
        session.user.role = (token.role as Role | undefined) ?? "AGENT";
      }
      return session;
    },
  },
});
