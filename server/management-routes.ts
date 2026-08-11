import type { Express } from "express";
import { z } from "zod";
import { requireAuth } from "./auth";
import { requireCapability, writeAuthorityAudit } from "./access-control";
import {
  getManagementRun,
  getRecentManagementRuns,
  runManagementCycle,
} from "./management-service";
import { openAiManagementConfigured } from "./management-openai";

const runRequestSchema = z.object({
  mode: z.enum(["deterministic", "hybrid"]).default("deterministic"),
});

export function registerManagementRoutes(app: Express) {
  app.get("/api/management/status", requireAuth, requireCapability("admin"), async (_req, res) => {
    res.json({
      deterministicAvailable: true,
      hybridConfigured: openAiManagementConfigured(),
    });
  });

  app.get("/api/management/runs", requireAuth, requireCapability("admin"), async (_req, res) => {
    const runs = await getRecentManagementRuns(25);
    res.json(runs);
  });

  app.get("/api/management/runs/:id", requireAuth, requireCapability("admin"), async (req, res) => {
    const runId = z.coerce.number().int().positive().parse(req.params.id);
    const result = await getManagementRun(runId);
    if (!result) return res.status(404).json({ message: "Management run not found" });
    return res.json(result);
  });

  app.post("/api/management/run", requireAuth, requireCapability("admin"), async (req, res) => {
    const input = runRequestSchema.parse(req.body ?? {});
    const result = await runManagementCycle(req.member!.id, input.mode);

    await writeAuthorityAudit({
      actor: req.member,
      authority: "admin",
      action: "run_cross_domain_ai_management_cycle",
      targetType: "ai_management_run",
      targetId: result.run.id,
      metadata: {
        mode: result.run.mode,
        provider: result.run.provider,
        proposalCount: result.proposalCount,
        findingCount: result.findings.length,
      },
    });

    return res.status(201).json({
      run: result.run,
      findings: result.findings,
      proposalCount: result.proposalCount,
      synthesisSummary: result.synthesisSummary,
    });
  });
}
