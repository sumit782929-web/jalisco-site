export type BookingCandidate = {
  email: string;
  reservationDate: string;
  timeSlot: string;
};

export function isSlotAvailable(reserved: number, capacity: number, isOpen: boolean) {
  return isOpen && reserved < capacity;
}

export function isDuplicateBooking(candidate: BookingCandidate, existing: BookingCandidate[]) {
  const email = candidate.email.trim().toLowerCase();
  return existing.some((reservation) => reservation.email.trim().toLowerCase() === email && reservation.reservationDate === candidate.reservationDate && reservation.timeSlot === candidate.timeSlot);
}
