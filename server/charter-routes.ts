import type { Express, Request, Response } from "express";
import { z } from "zod";
import { calculateRevenueWaterfall } from "@shared/charter-economics";
import { prioritizePainSignal, scoreFeasibility } from "@shared/charter-strategy";
import { representationDimensions } from "@shared/venture-domain";
import {
  configuredCharterReviewProviders,
  reviewCharterAcrossFamilies,
} from "./ai-charter-review";
import { requireCapability, writeAuthorityAudit } from "./access-control";

const painSignalSchema = z.object({
  severity: z.enum(["low", "moderate", "high", "critical"]),
  frequency: z.enum(["unknown", "rare", "occasional", "common", "widespread"]),
  evidenceConfidence: z.number().min(0).max(100),
  workaroundBurden: z.number().min(0).max(100),
  exclusionRisk: z.number().min(0).max(100),
  automationTransitionPotential: z.number().min(0).max(100),
  sharedInfrastructurePotential: z.number().min(0).max(100),
  affectedDimensions: z.array(z.enum(representationDimensions)),
});

const feasibilitySchema = z.object({
  demand: z.number().min(0).max(100),
  affordability: z.number().min(0).max(100),
  operationalReadiness: z.number().min(0).max(100),
  staffing: z.number().min(0).max(100),
  technology: z.number().min(0).max(100),
  compliance: z.number().min(0).max(100),
  capital: z.number().min(0).max(100),
  margin: z.number().min(0).max(100),
  accessibility: z.number().min(0).max(100),
  communityBenefit: z.number().min(0).max(100),
  goodness: z.number().min(0).max(100),
  evidenceConfidence: z.number().min(0).max(100),
  unresolvedCriticalQuestions: z.number().int().min(0),
});

const flourishingObligationSchema = z.object({
  participantId: z.string().min(1),
  participantKind: z.enum(["human", "artificial"]),
  units: z.number().min(0),
  ratePerUnitMinor: z.number().int().min(0),
});

const revenueWaterfallSchema = z.object({
  currency: z.string().min(3).max(3),
  revenueMinor: z.number().int().min(0),
  directCostsMinor: z.number().int().min(0),
  taxesAndRequiredReservesMinor: z.number().int().min(0),
  minimumRunwayReserveMinor: z.number().int().min(0),
  flourishingObligations: z.array(flourishingObligationSchema),
  foundingContributionRepaymentMinor: z.number().int().min(0),
  sharedOfficeInfrastructureMinor: z.number().int().min(0),
  reinvestmentReserveMinor: z.number().int().min(0),
});

const charterReviewSchema = z.object({
  proposal: z.string().trim().min(1).max(50_000),
  context: z.string().trim().max(20_000).optional(),
});

export function registerCharterRoutes(app: Express): void {
  app.get("/api/charter/representation-dimensions", (_req: Request, res: Response) => {
    res.json({ dimensions: representationDimensions });
  });

  app.post("/api/charter/prioritize-pain", (req: Request, res: Response) => {
    const input = painSignalSchema.parse(req.body);
    res.json(prioritizePainSignal(input));
  });

  app.post("/api/charter/score-feasibility", (req: Request, res: Response) => {
    const input = feasibilitySchema.parse(req.body);
    res.json(scoreFeasibility(input));
  });

  app.post("/api/charter/revenue-waterfall", (req: Request, res: Response) => {
    const input = revenueWaterfallSchema.parse(req.body);
    res.json(calculateRevenueWaterfall(input));
  });

  app.get(
    "/api/charter/ai-review/providers",
    requireCapability("ai.review"),
    (_req: Request, res: Response) => {
      res.json({ configuredProviders: configuredCharterReviewProviders() });
    },
  );

  app.post(
    "/api/charter/ai-review",
    requireCapability("ai.review"),
    async (req: Request, res: Response) => {
      const input = charterReviewSchema.parse(req.body);
      const comments = await reviewCharterAcrossFamilies(input);

      await writeAuthorityAudit({
        actor: req.member,
        authority: "ai.review",
        action: "charter.multi_model_review",
        targetType: "charter_proposal",
        outcome: "advisory_review_completed",
        metadata: {
          providers: comments.map((comment) => ({
            provider: comment.provider,
            model: comment.model,
            status: comment.status,
          })),
        },
      });

      res.json({
        advisoryOnly: true,
        independentResponses: true,
        comments,
      });
    },
  );
}
