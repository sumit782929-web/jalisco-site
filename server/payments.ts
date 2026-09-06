import { createHmac, timingSafeEqual } from "node:crypto";

export type PaymentMethod = "upi" | "card" | "international";

export type CheckoutRequest = {
  reservationId: number;
  paymentMethod: PaymentMethod;
  amount: number;
  currency: string;
};

export type CheckoutResult = {
  provider: string;
  status: "pending" | "created";
  checkoutUrl: string | null;
  sessionId: string | null;
  message: string;
};

export type GatewayWebhookEvent = {
  type: "payment.succeeded" | "payment.failed" | "payment.refunded";
  reservationId: number;
  providerPaymentId?: string;
};

/** Provider-neutral checkout boundary. Credentials stay server-side. */
export async function createGatewayCheckout(_request: CheckoutRequest): Promise<CheckoutResult> {
  const provider = process.env.PAYMENT_PROVIDER || "gateway_pending";
  return {
    provider,
    status: "pending",
    checkoutUrl: null,
    sessionId: null,
    message: provider === "gateway_pending"
      ? "Payment gateway credentials are not configured yet."
      : `${provider} adapter is ready for credential configuration.`,
  };
}

export function verifyGatewayWebhook(rawBody: string, signature: string | undefined) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const supplied = signature.replace(/^sha256=/, "");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const suppliedBuffer = Buffer.from(supplied, "utf8");
  return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
}

export function parseGatewayWebhook(rawBody: string): GatewayWebhookEvent {
  const parsed = JSON.parse(rawBody) as Partial<GatewayWebhookEvent>;
  if (!parsed || typeof parsed.reservationId !== "number" || !parsed.type || !["payment.succeeded", "payment.failed", "payment.refunded"].includes(parsed.type)) {
    throw new Error("Invalid payment webhook event");
  }
  return {
    type: parsed.type,
    reservationId: parsed.reservationId,
    providerPaymentId: parsed.providerPaymentId,
  };
}
