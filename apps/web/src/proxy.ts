import { NextResponse, type NextRequest } from "next/server";
import { decode } from "next-auth/jwt";

/**
 * Auth gate for the administrative area.
 *
 * It only decides where the visitor is sent: the real authorization stays in
 * `admin/(painel)/layout.tsx`, which calls `auth()` on the server. The session
 * JWT is verified here with `decode` (instead of importing `auth`) so bcrypt and
 * Prisma never reach the edge bundle. `salt` must be the cookie name — that is
 * what Auth.js uses when deriving the encryption key.
 */
const SESSION_COOKIES = ["authjs.session-token", "__Secure-authjs.session-token"];

async function readSession(req: NextRequest) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;

  for (const name of SESSION_COOKIES) {
    const token = req.cookies.get(name)?.value;
    if (!token) continue;
    try {
      const session = await decode({ token, secret, salt: name });
      if (session) return session;
    } catch {
      // Invalid or tampered cookie — treat as anonymous.
    }
  }
  return null;
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await readSession(req);
  const onLoginPage = pathname === "/admin/login";

  if (onLoginPage && session) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  if (!onLoginPage && !session) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
