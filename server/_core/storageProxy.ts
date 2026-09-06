import type { Express } from "express";

/**
 * Placeholder for a file-storage proxy. The current app (reservations +
 * payments) doesn't upload or serve files, so this just registers a clear
 * 404 for the reserved path instead of Manus's managed storage service.
 *
 * If you later need file uploads (e.g. a gallery image manager in the admin
 * dashboard), wire server/storage.ts up to a real provider (S3, Cloudinary,
 * etc.) and serve/redirect from here.
 */
export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", (_req, res) => {
    res.status(404).json({ error: "File storage is not configured for this deployment." });
  });
}
