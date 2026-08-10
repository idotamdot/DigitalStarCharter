import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "node:http";
import { setupAuth } from "./auth";
import { registerOperatingRoutes } from "./operating-routes";
import { registerResourceRoutes } from "./resource-routes";
import { registerLearningRoutes } from "./learning-routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: unknown;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse !== undefined) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      if (logLine.length > 160) logLine = `${logLine.slice(0, 159)}…`;
      log(logLine);
    }
  });

  next();
});

setupAuth(app);
registerResourceRoutes(app);
registerLearningRoutes(app);
registerOperatingRoutes(app);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "DigitalStarCharter" });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const error = err as { status?: number; statusCode?: number; message?: string };
  const status = error.status ?? error.statusCode ?? 500;
  const message = error.message ?? "Internal Server Error";
  res.status(status).json({ message });
});

const server = createServer(app);

if (app.get("env") === "development") {
  await setupVite(app, server);
} else {
  serveStatic(app);
}

const port = 5000;
server.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
  log(`serving on port ${port}`);
});
