/*
 * Jalisco Brews & Bites API layer.
 * Keeps transport concerns separate from the visual SPA and supports a real REST backend.
 */

import axios from "axios";

export type MenuItem = {
  name: string;
  description: string;
  price: string | number;
  isVeg?: boolean;
  spicyLevel?: number;
  imageUrl?: string;
};

export type MenuCategory = {
  name: string;
  items: MenuItem[];
};

export type GalleryItem = {
  imageUrl: string;
  title?: string;
  category?: string;
};

export type PaymentMethod = "upi" | "card" | "international";

export type ReservationPayload = {
  customerName: string;
  phoneNumber: string;
  email: string;
  reservationDate: string;
  timeSlot: string;
  guestCount: number;
  specialRequests: string;
  paymentMethod?: PaymentMethod;
  depositAmount?: number;
};

export type CheckoutPayload = {
  reservation: ReservationPayload;
  paymentMethod: PaymentMethod;
  amount: number;
  currency: "INR";
};

export type CheckoutResponse = {
  checkoutUrl?: string;
  sessionId?: string;
  status?: "created" | "pending";
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 9000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jalisco_auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || "The Jalisco service is temporarily unavailable.";
    return Promise.reject(new Error(message));
  },
);

export async function fetchMenu(): Promise<MenuCategory[]> {
  const response = await api.get<MenuCategory[]>("/menu");
  return response.data;
}

export async function fetchGallery(): Promise<GalleryItem[]> {
  const response = await api.get<GalleryItem[]>("/gallery");
  return response.data;
}

export async function createReservation(payload: ReservationPayload) {
  const response = await api.post("/reservations", payload);
  return response.data;
}

/** Backend adapter point for Razorpay, Stripe, or another provider. Never expose gateway secrets here. */
export async function createCheckoutSession(payload: CheckoutPayload): Promise<CheckoutResponse> {
  const response = await api.post<CheckoutResponse>("/payments/checkout", payload);
  return response.data;
}

export default api;
