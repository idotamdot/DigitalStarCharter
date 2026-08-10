import type { Express } from "express";
import { requireAuth } from "./auth";
import { requireCapability } from "./access-control";
import { ensureDefaultQualityStandards } from "./quality-service";

export function registerStandardBootstrapPrerequisites(app: Express): void {
  app.post(
    "/api/operating/bootstrap",
    requireAuth,
    requireCapability("admin"),
    async (req, _res, next) => {
      await ensureDefaultQualityStandards(req.member!.id);
      next();
    },
  );
}
