import type { Express } from "express";
import { requireAuth } from "./auth";
import { requireCapability } from "./access-control";
import { ensureDefaultGoodnessCriteria } from "./goodness-service";
import { ensureDefaultQualityStandards } from "./quality-service";

export function registerStandardBootstrapPrerequisites(app: Express): void {
  app.post(
    "/api/operating/bootstrap",
    requireAuth,
    requireCapability("admin"),
    async (req, _res, next) => {
      await Promise.all([
        ensureDefaultGoodnessCriteria(req.member!.id),
        ensureDefaultQualityStandards(req.member!.id),
      ]);
      next();
    },
  );
}
