import type { Request, Response } from "express";
import { updateReservationPayment } from "./db";
import { parseGatewayWebhook, verifyGatewayWebhook } from "./payments";

export async function handlePaymentWebhook(req: Request, res: Response, updatePayment = updateReservationPayment) {
  const rawBody = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : JSON.stringify(req.body ?? {});
  const signature = req.header("x-payment-signature");
  if (!verifyGatewayWebhook(rawBody, signature)) {
    res.status(401).json({ error: "Invalid webhook signature" });
    return;
  }

  try {
    const event = parseGatewayWebhook(rawBody);
    const paymentStatus = event.type === "payment.succeeded" ? "paid" : event.type === "payment.refunded" ? "refunded" : "failed";
    await updatePayment(event.reservationId, paymentStatus, event.providerPaymentId);
    res.json({ received: true });
  } catch (error) {
    console.error("[Payments] Invalid webhook payload", error);
    res.status(400).json({ error: "Invalid webhook payload" });
  }
}
