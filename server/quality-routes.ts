import type { Express } from "express";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "./db";
import { requireAuth } from "./auth";
import { memberHasCapability, requireCapability, writeAuthorityAudit } from "./access-control";
import {
  insertQualityStandardSchema,
  qualityReviewInputSchema,
  qualityReviews,
  qualityStandards,
} from "@shared/quality-schema";
import { workOrders } from "@shared/operating-schema";
import { ensureDefaultQualityStandards, evaluateWorkQualityGate } from "./quality-service";

export function registerQualityRoutes(app: Express) {
  app.post("/api/quality/bootstrap", requireAuth, requireCapability("admin"), async (req, res) => {
    const standards = await ensureDefaultQualityStandards(req.member!.id);
    await writeAuthorityAudit({
      actor: req.member,
      authority: "admin",
      action: "bootstrap_quality_standards",
      targetType: "quality_standards",
      metadata: { standardCount: standards.length },
    });
    res.json({ ok: true, standardCount: standards.length });
  });

  app.get("/api/quality/standards", requireAuth, async (_req, res) => {
    const rows = await db.select().from(qualityStandards).orderBy(qualityStandards.id);
    res.json(rows);
  });

  app.post("/api/quality/standards", requireAuth, requireCapability("quality.manage"), async (req, res) => {
    const input = insertQualityStandardSchema.parse({
      ...(typeof req.body === "object" && req.body !== null ? req.body : {}),
      createdByMemberId: req.member!.id,
    });
    const [created] = await db.insert(qualityStandards).values(input).returning();
    await writeAuthorityAudit({
      actor: req.member,
      authority: "quality.manage",
      action: "create_quality_standard",
      targetType: "quality_standard",
      targetId: created.id,
    });
    res.status(201).json(created);
  });

  app.get("/api/quality/work/:workOrderId", requireAuth, async (req, res) => {
    const workOrderId = z.coerce.number().int().positive().parse(req.params.workOrderId);
    const [work] = await db.select().from(workOrders).where(eq(workOrders.id, workOrderId)).limit(1);
    if (!work) return res.status(404).json({ message: "Work order not found" });

    const [reviews, gate] = await Promise.all([
      db.select().from(qualityReviews).where(eq(qualityReviews.workOrderId, workOrderId)).orderBy(desc(qualityReviews.createdAt)),
      evaluateWorkQualityGate(workOrderId, work.revenueType),
    ]);
    res.json({ reviews, gate });
  });

  app.post("/api/quality/reviews", requireAuth, requireCapability("quality.manage"), async (req, res) => {
    const input = qualityReviewInputSchema.parse(req.body as unknown);
    if (input.status === "waived") {
      if (!(await memberHasCapability(req.member!, "quality.override"))) {
        return res.status(403).json({ message: "Only the administrator may waive a quality standard" });
      }
      if (!input.notes?.trim()) {
        return res.status(400).json({ message: "A written reason is required to waive a quality standard" });
      }
    }

    const [work] = await db.select().from(workOrders).where(eq(workOrders.id, input.workOrderId)).limit(1);
    if (!work) return res.status(404).json({ message: "Work order not found" });
    const [standard] = await db.select().from(qualityStandards).where(eq(qualityStandards.id, input.standardId)).limit(1);
    if (!standard) return res.status(404).json({ message: "Quality standard not found" });

    const [created] = await db.insert(qualityReviews).values({
      ...input,
      reviewerMemberId: req.member!.id,
      reviewedAt: input.status === "pending" ? null : new Date(),
    }).returning();

    await writeAuthorityAudit({
      actor: req.member,
      authority: input.status === "waived" ? "quality.override" : "quality.manage",
      action: input.status === "waived" ? "waive_quality_standard" : "review_quality",
      targetType: "work_order",
      targetId: input.workOrderId,
      reason: input.notes,
      metadata: { standardId: input.standardId, status: input.status },
    });
    res.status(201).json(created);
  });
}
