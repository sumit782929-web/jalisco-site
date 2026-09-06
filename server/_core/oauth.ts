import type { Express } from "express";
import { COOKIE_NAME } from "@shared/const";
import { ENV } from "./env";
import { getSessionCookieOptions } from "./cookies";
import { createSessionCookieValue } from "./context";
import { upsertUser, getUserByOpenId } from "../db";

// Fixed identity for the single admin account. Since this app only needs one
// admin login (configured via ADMIN_EMAIL / ADMIN_PASSWORD), we don't need a
// full user-registration system — this just gives that admin a stable DB row.
const ADMIN_OPEN_ID = "local-admin";

/**
 * Registers standalone email/password auth routes.
 *
 * This replaces the original Manus-platform OAuth login (which only works
 * when the app is running inside Manus's own infrastructure) with a simple,
 * self-contained login suitable for any host. Set ADMIN_EMAIL and
 * ADMIN_PASSWORD in your environment variables to enable it.
 */
export function registerOAuthRoutes(app: Express) {
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = (req.body ?? {}) as { email?: string; password?: string };

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      if (!ENV.adminEmail || !ENV.adminPassword) {
        return res.status(500).json({
          error: "Admin login is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.",
        });
      }

      if (email !== ENV.adminEmail || password !== ENV.adminPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      await upsertUser({
        openId: ADMIN_OPEN_ID,
        email,
        name: "Admin",
        role: "admin",
        loginMethod: "password",
      });

      const token = await createSessionCookieValue(ADMIN_OPEN_ID);
      res.cookie(COOKIE_NAME, token, getSessionCookieOptions(req));

      const user = await getUserByOpenId(ADMIN_OPEN_ID);
      return res.json({ success: true, user });
    } catch (error) {
      console.error("[Auth] Login failed:", error);
      return res.status(500).json({ error: "Login failed. Please try again." });
    }
  });
}
