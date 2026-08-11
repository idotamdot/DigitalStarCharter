import type { Express } from "express";
import { requireAuth } from "./auth";
import { requireCapability, writeAuthorityAudit } from "./access-control";

export function registerDecisionExecutionGuard(app: Express) {
  app.post(
    "/api/operating/ai-decisions/:id/execute",
    requireAuth,
    requireCapability("ai.execute"),
    async (req, res) => {
      await writeAuthorityAudit({
        actor: req.member,
        authority: "ai.execute",
        action: "reject_untyped_ai_execution",
        targetType: "ai_decision",
        targetId: req.params.id,
        outcome: "denied",
        reason: "AI recommendations are advisory until an explicit typed domain executor exists for the requested action.",
      });
      return res.status(409).json({
        message: "This proposal is advisory. Approval records human judgment; it does not execute a domain action. Use the appropriate human-controlled domain workflow instead.",
      });
    },
  );
}
