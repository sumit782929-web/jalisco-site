import express, { type Express } from "express";
import type { Server } from "node:http";
import path from "node:path";
import fs from "node:fs";

// Using process.cwd() rather than import.meta.dirname here on purpose: in
// dev this file runs unbundled from server/_core, but in production it gets
// bundled by esbuild into a single dist/index.js, which would change what
// "this file's directory" means. The app is always started from the project
// root (pnpm dev / node dist/index.js), so process.cwd() is stable in both.
const projectRoot = process.cwd();

export async function setupVite(app: Express, server: Server) {
  const { createServer: createViteServer } = await import("vite");

  const vite = await createViteServer({
    server: { middlewareMode: true, hmr: { server } },
    appType: "custom",
    root: path.resolve(projectRoot, "client"),
  });

  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path.resolve(projectRoot, "client", "index.html");
      let template = fs.readFileSync(clientTemplate, "utf-8");
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (error) {
      vite.ssrFixStacktrace(error as Error);
      next(error);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(projectRoot, "dist", "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(`Could not find the client build at ${distPath}. Run the build script first.`);
  }

  app.use(express.static(distPath));

  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
