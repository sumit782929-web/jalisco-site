import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { Request, Response } from "express";
import { SignJWT, jwtVerify } from "jose";
import { COOKIE_NAME } from "@shared/const";
import { ENV } from "./env";
import { getUserByOpenId } from "../db";
import type { User } from "../../drizzle/schema";

const secretKey = new TextEncoder().encode(ENV.sessionSecret);

/** Signs a session token that only carries the user's openId; the rest of the
 * user record (role, email, name) is always re-read fresh from the database
 * on every request, so role changes take effect immediately. */
export async function createSessionCookieValue(openId: string): Promise<string> {
  return new SignJWT({ openId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey);
}

async function verifySessionCookie(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return typeof payload.openId === "string" ? payload.openId : null;
  } catch {
    return null;
  }
}

function parseCookies(header?: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  }
  return out;
}

export type TrpcContext = {
  req: Request;
  res: Response;
  user: User | null;
};

export async function createContext({ req, res }: CreateExpressContextOptions): Promise<TrpcContext> {
  const cookies = parseCookies(req.headers.cookie);
  const bearerHeader = req.headers.authorization;
  const bearerToken = bearerHeader?.startsWith("Bearer ") ? bearerHeader.slice(7) : undefined;
  const token = cookies[COOKIE_NAME] || bearerToken;

  let user: User | null = null;
  if (token) {
    const openId = await verifySessionCookie(token);
    if (openId) {
      user = (await getUserByOpenId(openId)) ?? null;
    }
  }

  return { req, res, user };
}
