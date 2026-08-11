import express, { type Express, type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { setupAuth } from "./auth";
import { registerAccountingRoutes } from "./accounting-routes";
import { registerLearningRoutes } from "./learning-routes";
import { registerManagementRoutes } from "./management-routes";
import { registerMemberRoutes } from "./member-routes";
import { registerOperatingRoutes } from "./operating-routes";
import { enforceQualityBeforeCompletion } from "./quality-completion-guard";
import { registerQualityRoutes } from "./quality-routes";
import { registerResourceRoutes } from "./resource-routes";
import { registerStandardBootstrapPrerequisites } from "./standard-bootstrap";
import { log } from "./log";

interface HttpErrorShape {
  status?: number;
  statusCode?: number;
  message?: string;
}

export function createApp(): Express {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));

  app.use((req, res, next) => {
    const startedAt = Date.now();
    res.on("finish", () => {
      if (req.path.startsWith("/api")) {
        log(`${req.method} ${req.path} ${res.statusCode} in ${Date.now() - startedAt}ms`);
      }
    });
    next();
  });

  setupAuth(app);
  registerMemberRoutes(app);
  registerResourceRoutes(app);
  registerLearningRoutes(app);
  registerAccountingRoutes(app);
  registerQualityRoutes(app);
  registerManagementRoutes(app);
  registerStandardBootstrapPrerequisites(app);
  app.use(enforceQualityBeforeCompletion);
  registerOperatingRoutes(app);

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "DigitalStarCharter" });
  });

  return app;
}

export function attachErrorHandler(app: Express): void {
  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Invalid request",
        issues: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const normalized: HttpErrorShape = error instanceof Error
      ? { message: error.message }
      : typeof error === "object" && error !== null
        ? error as HttpErrorShape
        : {};
    const status = normalized.status ?? normalized.statusCode ?? 500;
    const message = normalized.message ?? "Internal Server Error";
    return res.status(status).json({ message });
  });
}
