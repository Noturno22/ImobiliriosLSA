import { handlers } from "@/auth";

// Prisma/PGlite require the Node.js runtime, not Edge.
export const runtime = "nodejs";

export const { GET, POST } = handlers;
