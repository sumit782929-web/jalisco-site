# Jalisco Brews & Bites Handoff Guide

## Current release

Jalisco Brews & Bites is now a full-stack restaurant booking application with the Modern Fiesta luxury pop-art frontend, persistent reservation storage, persisted availability overrides, duplicate-booking protection, gateway-neutral payment contracts, signed payment-webhook handling, and a protected admin reservations route.

The public experience includes the animated hero, menu categories, gallery, restaurant details, booking drawer, gateway-neutral payment method selection, map link, mobile actions, reduced-motion support, and the supplied Jalisco Noida contact information.

## Business details currently configured

| Field | Current value |
|---|---|
| Restaurant | Jalisco Brews & Bites Noida |
| Address | Unit No. 05, 3rd Floor, Building Urbtech NPX, Sector 153, Greater Noida, Noida, Uttar Pradesh 201304 |
| Hours | Every day, 1:00 PM–2:00 AM |
| Phone | 09211313486 |
| Instagram | @jalisco.brews |
| Live payments | Deferred until an organization merchant account exists |

## Backend architecture

The application uses the full-stack template with React, Express, tRPC, Drizzle, MySQL/TiDB, and Manus authentication. Public reservation procedures create bookings and create gateway-neutral checkout intents. Availability procedures read persisted slot capacity and open/closed state. Protected admin procedures list reservations and update reservation status.

The payment boundary is intentionally provider-neutral. It does not accept or process live money until a merchant gateway account and server-side credentials are configured. The webhook route is available at `/api/payments/webhook` and validates a signed normalized event before updating reservation payment status.

## Important files

| File | Purpose |
|---|---|
| `client/src/pages/Home.tsx` | Public restaurant experience and typed booking flow |
| `client/src/pages/AdminReservations.tsx` | Protected admin reservation view |
| `client/src/App.tsx` | Public and admin route registration |
| `client/src/index.css` | Luxury Modern Fiesta visual and responsive system |
| `drizzle/schema.ts` | Users, reservations, and availability tables |
| `server/db.ts` | Reservation, availability, and admin database helpers |
| `server/routers.ts` | Public reservation, availability, checkout, and admin procedures |
| `server/payments.ts` | Provider-neutral checkout and webhook contracts |
| `server/paymentWebhook.ts` | Signed webhook request handler |
| `server/bookingRules.ts` | Capacity and duplicate-booking rules |
| `server/*.test.ts` | Auth, booking rules, checkout, and webhook tests |

## Run locally

```bash
pnpm install
pnpm dev
```

## Validate before publishing

```bash
pnpm check
pnpm test
pnpm build
```

## Deferred Razorpay activation

Razorpay is not active in the current release because an organization merchant account is not yet available. When the account exists, configure Razorpay Test Mode first and add these server-side secrets through the project secret manager:

| Secret | Purpose |
|---|---|
| `RAZORPAY_KEY_ID` | Identifies the Razorpay merchant account for order creation |
| `RAZORPAY_KEY_SECRET` | Authenticates server-side Razorpay API requests |
| `RAZORPAY_WEBHOOK_SECRET` | Verifies signed Razorpay payment events |

After adding the secrets, connect the Razorpay order-creation adapter to the existing `/payments/checkout` procedure, configure the Razorpay webhook URL as `/api/payments/webhook`, test successful and failed payments in Test Mode, and only then switch to Live Mode.

## Notifications — Future enhancement

The current release persists reservations and payment state but does not send outbound notifications. A future notification layer should send an email, WhatsApp message, or SMS to the restaurant team when a reservation is created, when payment succeeds or fails, and when an admin confirms, rejects, or cancels a booking. Customer confirmations should be sent after reservation and payment status are finalized. This enhancement will require a notification provider and server-side credentials.

## Publishing checklist

Before publishing, confirm the final menu, prices, images, legal/privacy content, reservation policy, and exact map pin. The project has been validated with TypeScript, Vitest, production build, and responsive visual checks. Create or use the latest project checkpoint, then click the **Publish** button in the Management UI. Do not publish until the final restaurant content and payment decision are confirmed.
