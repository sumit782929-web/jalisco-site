import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { Availability, InsertReservation, InsertUser, availability, reservations, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;

  for (const field of textFields) {
    if (user[field] === undefined) continue;
    const value = user[field] ?? null;
    values[field] = value;
    updateSet[field] = value;
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  values.lastSignedIn ??= new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getAvailabilityForSlot(serviceDate: string, timeSlot: string): Promise<Availability | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(availability).where(and(eq(availability.serviceDate, serviceDate), eq(availability.timeSlot, timeSlot))).limit(1);
  return result[0];
}

export async function findDuplicateReservation(email: string, reservationDate: string, timeSlot: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select({ id: reservations.id }).from(reservations).where(and(eq(reservations.email, email), eq(reservations.reservationDate, reservationDate), eq(reservations.timeSlot, timeSlot), sql`${reservations.reservationStatus} <> 'cancelled'`)).limit(1);
  return result[0];
}

export async function countReservationsForSlot(reservationDate: string, timeSlot: string) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(reservations)
    .where(and(eq(reservations.reservationDate, reservationDate), eq(reservations.timeSlot, timeSlot), sql`${reservations.reservationStatus} <> 'cancelled'`));
  return Number(result[0]?.count ?? 0);
}

export async function createReservation(input: InsertReservation) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.insert(reservations).values(input);
  const id = Number(result[0].insertId);
  const created = await db.select().from(reservations).where(eq(reservations.id, id)).limit(1);
  return created[0];
}

export async function getReservations() {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.select().from(reservations).orderBy(desc(reservations.createdAt));
}

export async function updateReservationStatus(id: number, reservationStatus: "pending" | "confirmed" | "cancelled" | "rejected") {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(reservations).set({ reservationStatus }).where(eq(reservations.id, id));
  const updated = await db.select().from(reservations).where(eq(reservations.id, id)).limit(1);
  return updated[0];
}

export async function updateReservationPayment(id: number, paymentStatus: "pending" | "paid" | "failed" | "refunded", providerPaymentId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(reservations).set({ paymentStatus, providerPaymentId }).where(eq(reservations.id, id));
  const updated = await db.select().from(reservations).where(eq(reservations.id, id)).limit(1);
  return updated[0];
}
