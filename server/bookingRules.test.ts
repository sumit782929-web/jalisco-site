import { describe, expect, it } from "vitest";
import { isDuplicateBooking, isSlotAvailable } from "./bookingRules";

describe("booking rules", () => {
  it("rejects a full or closed slot", () => {
    expect(isSlotAvailable(12, 12, true)).toBe(false);
    expect(isSlotAvailable(0, 12, false)).toBe(false);
    expect(isSlotAvailable(11, 12, true)).toBe(true);
  });

  it("detects a duplicate active booking by email, date, and time", () => {
    expect(isDuplicateBooking(
      { email: "Guest@Example.com", reservationDate: "2026-09-10", timeSlot: "20:00" },
      [{ email: "guest@example.com", reservationDate: "2026-09-10", timeSlot: "20:00" }],
    )).toBe(true);
    expect(isDuplicateBooking(
      { email: "guest@example.com", reservationDate: "2026-09-10", timeSlot: "21:00" },
      [{ email: "guest@example.com", reservationDate: "2026-09-10", timeSlot: "20:00" }],
    )).toBe(false);
  });
});
