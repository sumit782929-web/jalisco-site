import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, index } from "drizzle-orm/mysql-core";

/** Core user table backing Manus authentication. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const reservations = mysqlTable(
  "reservations",
  {
    id: int("id").autoincrement().primaryKey(),
    customerName: varchar("customerName", { length: 160 }).notNull(),
    phoneNumber: varchar("phoneNumber", { length: 32 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    reservationDate: varchar("reservationDate", { length: 10 }).notNull(),
    timeSlot: varchar("timeSlot", { length: 5 }).notNull(),
    guestCount: int("guestCount").notNull(),
    specialRequests: text("specialRequests"),
    paymentMethod: mysqlEnum("paymentMethod", ["upi", "card", "international"]).notNull(),
    depositAmount: int("depositAmount").notNull().default(500),
    currency: varchar("currency", { length: 3 }).notNull().default("INR"),
    paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed", "refunded"]).notNull().default("pending"),
    reservationStatus: mysqlEnum("reservationStatus", ["pending", "confirmed", "cancelled", "rejected"]).notNull().default("pending"),
    provider: varchar("provider", { length: 32 }).notNull().default("gateway_pending"),
    providerOrderId: varchar("providerOrderId", { length: 160 }),
    providerPaymentId: varchar("providerPaymentId", { length: 160 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    dateSlotIdx: index("reservations_date_slot_idx").on(table.reservationDate, table.timeSlot),
    paymentStatusIdx: index("reservations_payment_status_idx").on(table.paymentStatus),
    reservationStatusIdx: index("reservations_reservation_status_idx").on(table.reservationStatus),
  }),
);

export const availability = mysqlTable(
  "availability",
  {
    id: int("id").autoincrement().primaryKey(),
    serviceDate: varchar("serviceDate", { length: 10 }).notNull(),
    timeSlot: varchar("timeSlot", { length: 5 }).notNull(),
    capacity: int("capacity").notNull().default(12),
    isOpen: int("isOpen").notNull().default(1),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    serviceSlotIdx: index("availability_service_slot_idx").on(table.serviceDate, table.timeSlot),
  }),
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = typeof reservations.$inferInsert;
export type Availability = typeof availability.$inferSelect;
export type InsertAvailability = typeof availability.$inferInsert;
