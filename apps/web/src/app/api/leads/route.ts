import { NextResponse } from "next/server";
import { RequestType } from "@serrote/domain";
import { leadCreateSchema, parsePreferredDateTime } from "@serrote/validation";
import { requestTypeLabels } from "@/lib/labels";
import { buildLeadMessage } from "@/lib/site";
import { sendWhatsAppNotification } from "@/lib/whatsapp-notify";

export async function POST(request: Request) {
  const payload: unknown = await (async () => {
    try {
      return await request.json();
    } catch {
      return null;
    }
  })();

  if (payload === null) {
    return NextResponse.json({ ok: false, error: "Pedido inválido." }, { status: 400 });
  }

  // Honeypot was filled in — accept silently without persisting, and never
  // surface a validation error that would reveal the trap to bots.
  const honeypot = (payload as Record<string, unknown>).company;
  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  const parsed = leadCreateSchema.safeParse(payload);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      { ok: false, error: issue?.message ?? "Verifique os dados introduzidos." },
      { status: 422 },
    );
  }

  const data = parsed.data;

  // The client sends a preferred slot as separate date + time; anchor it to
  // Angola (UTC+1) so the team sees the moment the customer actually wants.
  const preferredAt = parsePreferredDateTime(data.preferredDate, data.preferredTime);
  const preferredLabel =
    preferredAt === null
      ? undefined
      : new Intl.DateTimeFormat("pt-PT", {
          dateStyle: "full",
          timeStyle: "short",
          timeZone: "Africa/Luanda",
        }).format(preferredAt);

  // Resolve the property before notifying so the WhatsApp alert carries a
  // reference/title the team recognises instead of an internal UUID.
  const url = process.env.DATABASE_URL;
  let property: { reference: string; title: string } | null = null;
  if (url?.trim() && data.propertyId) {
    try {
      const { getPrisma } = await import("@serrote/database");
      const prisma = await getPrisma();
      property = await prisma.property.findUnique({
        where: { id: data.propertyId },
        select: { reference: true, title: true },
      });
    } catch (error) {
      console.error("[leads] failed to resolve the property for notification:", error);
    }
  }

  // Deliver straight to the company WhatsApp so the lead is never lost.
  const message = buildLeadMessage({
    name: data.name,
    phone: data.phone,
    email: data.email,
    requestLabel: requestTypeLabels[data.requestType as RequestType] ?? "Informação geral",
    propertyTitle: property?.title,
    propertyRef: property?.reference ?? data.propertyId ?? undefined,
    preferred: preferredLabel,
    message: data.message,
  });
  const notified = await sendWhatsAppNotification(message);

  if (!url?.trim()) {
    if (notified) return NextResponse.json({ ok: true });
    return NextResponse.json(
      {
        ok: false,
        error:
          "O registo de contactos ainda não está configurado neste ambiente. Tente mais tarde ou fale connosco por WhatsApp.",
      },
      { status: 503 },
    );
  }

  try {
    const { getPrisma } = await import("@serrote/database");
    const prisma = await getPrisma();
    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email ?? null,
        propertyId: data.propertyId ?? null,
        requestType: data.requestType as RequestType,
        message: data.message ?? null,
        consent: true,
      },
    });

    // A "viewing" request also opens an appointment for the team to manage.
    if (data.requestType === RequestType.VIEWING && data.propertyId) {
      await prisma.appointment.create({
        data: {
          propertyId: data.propertyId,
          leadId: lead.id,
          requestedAt: preferredAt ?? new Date(),
          status: "REQUESTED",
          notes: data.message ?? null,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[leads] failed to persist lead:", error);
    if (notified) return NextResponse.json({ ok: true });
    return NextResponse.json(
      { ok: false, error: "Não foi possível enviar o seu pedido. Tente novamente." },
      { status: 500 },
    );
  }
}
