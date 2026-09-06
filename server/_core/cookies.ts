import type { Request } from "express";

/**
 * Options for the session cookie set on login and cleared on logout.
 * sameSite: "none" + secure: true is required for the cookie to survive
 * being loaded inside a cross-site iframe (e.g. an in-app preview); it also
 * works fine for a normal top-level site as long as it's served over HTTPS,
 * which Render (and most hosts) provide by default.
 */
export function getSessionCookieOptions(_req?: Request) {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "none" as const,
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days, in ms (Express convention)
  };
}
