/**
 * Server-only: sends a WhatsApp message to the company through the CallMeBot
 * HTTP API (https://www.callmebot.com/blog/free-api-whatsapp-messages/).
 *
 * Requires the company phone to have activated its API key by messaging the
 * CallMeBot WhatsApp bot once. Configure via:
 *   CALLMEBOT_PHONE  — company WhatsApp number, international digits (e.g. 244926717730)
 *   CALLMEBOT_APIKEY — the key the bot replies with
 *
 * When either variable is missing the notification is skipped and `false` is
 * returned so callers can fall back gracefully.
 */
export async function sendWhatsAppNotification(message: string): Promise<boolean> {
  const phone = process.env.CALLMEBOT_PHONE?.replace(/\D/g, "") ?? "";
  const apikey = process.env.CALLMEBOT_APIKEY?.trim() ?? "";

  if (!phone || !apikey) return false;

  const url =
    "https://api.callmebot.com/whatsapp.php" +
    `?phone=${encodeURIComponent(phone)}` +
    `&text=${encodeURIComponent(message)}` +
    `&apikey=${encodeURIComponent(apikey)}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.error("[whatsapp] CallMeBot responded with status", res.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[whatsapp] CallMeBot request failed:", error);
    return false;
  }
}

/** True when the server has everything needed to notify via WhatsApp. */
export function whatsappNotifyConfigured(): boolean {
  return Boolean(process.env.CALLMEBOT_PHONE?.replace(/\D/g, "")) && Boolean(process.env.CALLMEBOT_APIKEY?.trim());
}
