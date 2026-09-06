/**
 * Centralized environment variable access for the server.
 *
 * Required for a standalone (non-Manus) deployment:
 *   DATABASE_URL     - MySQL connection string (Drizzle uses mysql2 driver)
 *   SESSION_SECRET   - any long random string, used to sign login session cookies
 *   ADMIN_EMAIL      - email the admin dashboard login accepts
 *   ADMIN_PASSWORD   - password the admin dashboard login accepts
 *
 * Optional:
 *   PAYMENT_PROVIDER, PAYMENT_WEBHOOK_SECRET - see server/payments.ts
 *   BUILT_IN_FORGE_API_URL / BUILT_IN_FORGE_API_KEY - only needed if you wire
 *     server/storage.ts up to a real file-storage backend later.
 */

export const ENV = {
  databaseUrl: process.env.DATABASE_URL || "",
  sessionSecret: process.env.SESSION_SECRET || "dev-insecure-secret-change-me",
  adminEmail: process.env.ADMIN_EMAIL || "",
  adminPassword: process.env.ADMIN_PASSWORD || "",
  ownerOpenId: process.env.OWNER_OPEN_ID || "local-admin",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL || "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY || "",
  nodeEnv: process.env.NODE_ENV || "development",
};

if (ENV.nodeEnv === "production" && ENV.sessionSecret === "dev-insecure-secret-change-me") {
  console.warn(
    "[env] SESSION_SECRET is not set. Using an insecure default — set a real SESSION_SECRET in production."
  );
}
