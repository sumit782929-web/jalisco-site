import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { handlePaymentWebhook } from "./paymentWebhook";

function responseDouble() {
  const result = { statusCode: 200, body: undefined as unknown };
  return {
    result,
    status(code: number) { result.statusCode = code; return this; },
    json(body: unknown) { result.body = body; return this; },
  } as any;
}

describe("payment webhook handler", () => {
  it("updates a reservation for a valid signed success event", async () => {
    const body = JSON.stringify({ type: "payment.succeeded", reservationId: 7, providerPaymentId: "pay_7" });
    process.env.PAYMENT_WEBHOOK_SECRET = "webhook-secret";
    const signature = createHmac("sha256", "webhook-secret").update(body).digest("hex");
    const response = responseDouble();
    let updated: unknown;
    const request = { body: Buffer.from(body), header: (name: string) => name === "x-payment-signature" ? signature : undefined } as any;

    await handlePaymentWebhook(request, response as any, async (id, status, paymentId) => {
      updated = { id, status, paymentId };
      return undefined;
    });

    expect(response.result.statusCode).toBe(200);
    expect(response.result.body).toEqual({ received: true });
    expect(updated).toEqual({ id: 7, status: "paid", paymentId: "pay_7" });
  });

  it("rejects an invalid signature before touching the database", async () => {
    const response = responseDouble();
    const request = { body: Buffer.from("{}"), header: () => "invalid" } as any;
    let called = false;

    await handlePaymentWebhook(request, response as any, async () => { called = true; return undefined; });

    expect(response.result.statusCode).toBe(401);
    expect(response.result.body).toEqual({ error: "Invalid webhook signature" });
    expect(called).toBe(false);
  });
});
