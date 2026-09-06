export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Sends the user to the standalone admin login page. Call this from an event
// handler, e.g. `onClick={() => startLogin()}`.
export const startLogin = () => {
  if (typeof window !== "undefined") {
    window.location.href = "/admin/login";
  }
};
