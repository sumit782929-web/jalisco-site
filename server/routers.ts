import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import { z } from "zod";
import { countReservationsForSlot, createReservation, findDuplicateReservation, getAvailabilityForSlot, getReservations, updateReservationPayment, updateReservationStatus } from "./db";
import { isSlotAvailable } from "./bookingRules";
import { createGatewayCheckout } from "./payments";

const paymentMethod = z.enum(["upi", "card", "international"]);
const reservationStatus = z.enum(["pending", "confirmed", "cancelled", "rejected"]);
const reservationInput = z.object({
  customerName: z.string().trim().min(2).max(160),
  phoneNumber: z.string().trim().min(7).max(32),
  email: z.string().email().max(320),
  reservationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/),
  guestCount: z.number().int().min(1).max(20),
  specialRequests: z.string().trim().max(1000).optional().default(""),
  paymentMethod,
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  reservations: router({
    availability: publicProcedure
      .input(z.object({ reservationDate: z.string(), timeSlot: z.string() }))
      .query(async ({ input }) => {
        const slot = await getAvailabilityForSlot(input.reservationDate, input.timeSlot);
        const reserved = await countReservationsForSlot(input.reservationDate, input.timeSlot);
        const capacity = slot?.capacity ?? 12;
        return {
          reservationDate: input.reservationDate,
          timeSlot: input.timeSlot,
          reserved,
          capacity,
          isOpen: slot?.isOpen !== 0,
          available: Math.max(capacity - reserved, 0),
        };
      }),
    create: publicProcedure.input(reservationInput).mutation(async ({ input }) => {
      const slot = await getAvailabilityForSlot(input.reservationDate, input.timeSlot);
      const reserved = await countReservationsForSlot(input.reservationDate, input.timeSlot);
      const capacity = slot?.capacity ?? 12;
      if (!isSlotAvailable(reserved, capacity, slot?.isOpen !== 0)) {
        throw new Error("That time slot is currently full or closed. Please choose another time.");
      }
      const duplicate = await findDuplicateReservation(input.email, input.reservationDate, input.timeSlot);
      if (duplicate) throw new Error("You already have a booking request for this time slot.");
      return createReservation({
        ...input,
        specialRequests: input.specialRequests || null,
        depositAmount: 500,
        currency: "INR",
        paymentStatus: "pending",
        reservationStatus: "pending",
        provider: "gateway_pending",
      });
    }),
    list: adminProcedure.query(() => getReservations()),
    updateStatus: adminProcedure
      .input(z.object({ id: z.number().int().positive(), reservationStatus }))
      .mutation(({ input }) => updateReservationStatus(input.id, input.reservationStatus)),
  }),
  payments: router({
    createCheckout: publicProcedure
      .input(z.object({ reservationId: z.number().int().positive(), paymentMethod, amount: z.number().int().positive().default(500), currency: z.string().length(3).default("INR") }))
      .mutation(async ({ input }) => createGatewayCheckout(input)),
    markPendingFailure: adminProcedure
      .input(z.object({ id: z.number().int().positive(), paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]), providerPaymentId: z.string().max(160).optional() }))
      .mutation(({ input }) => updateReservationPayment(input.id, input.paymentStatus, input.providerPaymentId)),
  }),
});

export type AppRouter = typeof appRouter;
