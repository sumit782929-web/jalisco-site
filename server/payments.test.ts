import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { createGatewayCheckout, parseGatewayWebhook, verifyGatewayWebhook } from "./payments";

afterEach(() => {
  delete process.env.PAYMENT_WEBHOOK_SECRET;
  delete process.env.PAYMENT_PROVIDER;
});

describe("gateway-neutral checkout adapter", () => {
  it("returns a pending checkout when no provider credentials are configured", async () => {
    const result = await createGatewayCheckout({ reservationId: 12, paymentMethod: "upi", amount: 500, currency: "INR" });
    expect(result.status).toBe("pending");
    expect(result.checkoutUrl).toBeNull();
    expect(result.sessionId).toBeNull();
    expect(result.provider).toBe("gateway_pending");
  });
});

describe("payment webhooks", () => {
  it("verifies a signed webhook and parses the normalized event", () => {
    const body = JSON.stringify({ type: "payment.succeeded", reservationId: 42, providerPaymentId: "pay_123" });
    process.env.PAYMENT_WEBHOOK_SECRET = "test-secret";
    const signature = createHmac("sha256", "test-secret").update(body).digest("hex");
    expect(verifyGatewayWebhook(body, signature)).toBe(true);
    expect(parseGatewayWebhook(body)).toEqual({ type: "payment.succeeded", reservationId: 42, providerPaymentId: "pay_123" });
  });

  it("rejects a bad signature and malformed event", () => {
    process.env.PAYMENT_WEBHOOK_SECRET = "test-secret";
    expect(verifyGatewayWebhook("{}", "bad-signature")).toBe(false);
    expect(() => parseGatewayWebhook("{}" as string)).toThrow("Invalid payment webhook event");
  });
});
