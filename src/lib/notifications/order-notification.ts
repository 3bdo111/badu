/**
 * New-order notifications to the store owner.
 *
 * Destination: +201096093187 (store owner side, confirmed 28 Nov 2026).
 *
 * Delivery method: WhatsApp Cloud API (Meta). Set these in Vercel to enable:
 *   WHATSAPP_CLOUD_API_TOKEN   permanent token for the Meta app
 *   WHATSAPP_PHONE_NUMBER_ID   sender phone number id
 *   WHATSAPP_API_VERSION       optional, defaults to v21.0
 *   ORDER_NOTIFY_WHATSAPP      optional, defaults to the owner number below
 *
 * Without the two required variables nothing is sent: the message is built
 * and logged so the order is never lost, and the caller stays non-blocking
 * so a notification failure can never fail a customer order.
 */
import type { OrderRecord } from "@/lib/repositories/server-order-repository";

export const OWNER_WHATSAPP = process.env.ORDER_NOTIFY_WHATSAPP || "+201096093187";

function egp(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function buildOwnerOrderMessage(order: OrderRecord): string {
  const lines = [
    "New BADU order",
    `Order: ${order.orderNumber}`,
    "",
    ...order.items.map(
      (item) =>
        `- ${item.productNameEn} / ${item.size} / x${item.quantity} / ${egp(item.lineTotal, order.currency)}`
    ),
    "",
    `Subtotal: ${egp(order.subtotalAmount, order.currency)}`,
    `Shipping: ${egp(Math.max(0, order.totalAmount - order.subtotalAmount), order.currency)}`,
    `Total (COD): ${egp(order.totalAmount, order.currency)}`,
    "",
    "Customer:",
    `Name: ${order.customerName}`,
    `Phone: ${order.customerPhone}`,
    `Address: ${order.shippingAddress}, ${order.city}, ${order.country}`,
    order.notes ? `Notes: ${order.notes}` : "",
  ];
  return lines.filter(Boolean).join("\n");
}

export async function notifyOwnerOfNewOrder(
  order: OrderRecord
): Promise<{ sent: boolean; reason?: string }> {
  const message = buildOwnerOrderMessage(order);
  const token = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const version = process.env.WHATSAPP_API_VERSION || "v21.0";

  if (!token || !phoneNumberId) {
    console.info(`[order-notify] WhatsApp not configured. Message for ${OWNER_WHATSAPP}:\n${message}`);
    return { sent: false, reason: "whatsapp_not_configured" };
  }

  try {
    const res = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: OWNER_WHATSAPP.replace(/\D/g, ""),
        type: "text",
        text: { preview_url: false, body: message },
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error(`[order-notify] WhatsApp send failed (${res.status}): ${detail}`);
      return { sent: false, reason: `whatsapp_http_${res.status}` };
    }
    return { sent: true };
  } catch (err) {
    console.error("[order-notify] WhatsApp send threw:", err);
    return { sent: false, reason: "whatsapp_error" };
  }
}
