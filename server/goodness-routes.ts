import type { Express } from "express";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "./db";
import { requireAuth } from "./auth";
import { requireCapability, writeAuthorityAudit } from "./access-control";
import { goodnessCriteria, goodnessReviewInputSchema, goodnessReviews } from "@shared/goodness-schema";
import { workOrders } from "@shared/operating-schema";
import { ensureDefaultGoodnessCriteria, ensureGoodnessStewardRole, evaluateGoodnessGate } from "./goodness-service";

export function registerGoodnessRoutes(app: Express): void {
  app.post("/api/goodness/bootstrap", requireAuth, requireCapability("goodness.manage"), async (req, res) => {
    const [criteria, role] = await Promise.all([
      ensureDefaultGoodnessCriteria(req.member!.id),
      ensureGoodnessStewardRole(),
    ]);
    await writeAuthorityAudit({
      actor: req.member,
      authority: "goodness.manage",
      action: "bootstrap_goodness_system",
      targetType: "goodness",
      metadata: { criterionCount: criteria.length, goodnessStewardRoleId: role.id },
    });
    res.json({ ok: true, criterionCount: criteria.length, goodnessStewardRoleId: role.id });
  });

  app.get("/api/goodness/criteria", requireAuth, async (_req, res) => {
    const criteria = await db.select().from(goodnessCriteria).orderBy(goodnessCriteria.id);
    res.json(criteria);
  });

  app.get("/api/goodness/work/:workOrderId", requireAuth, async (req, res) => {
    const workOrderId = z.coerce.number().int().positive().parse(req.params.workOrderId);
    const [work] = await db.select().from(workOrders).where(eq(workOrders.id, workOrderId)).limit(1);
    if (!work) return res.status(404).json({ message: "Work order not found" });

    const [criteria, reviews, gate] = await Promise.all([
      db.select().from(goodnessCriteria).where(eq(goodnessCriteria.active, true)).orderBy(goodnessCriteria.id),
      db.select().from(goodnessReviews).where(eq(goodnessReviews.workOrderId, workOrderId)).orderBy(desc(goodnessReviews.createdAt)),
      evaluateGoodnessGate(workOrderId),
    ]);
    res.json({ criteria, reviews, gate });
  });

  app.post("/api/goodness/reviews", requireAuth, requireCapability("goodness.review"), async (req, res) => {
    const input = goodnessReviewInputSchema.parse(req.body as unknown);
    const [work] = await db.select().from(workOrders).where(eq(workOrders.id, input.workOrderId)).limit(1);
    if (!work) return res.status(404).json({ message: "Work order not found" });
    const [criterion] = await db.select().from(goodnessCriteria).where(eq(goodnessCriteria.id, input.criterionId)).limit(1);
    if (!criterion) return res.status(404).json({ message: "Goodness criterion not found" });
    if (!criterion.active) return res.status(409).json({ message: "Inactive Goodness criteria cannot be reviewed" });

    const [created] = await db.insert(goodnessReviews).values({
      ...input,
      reviewerMemberId: req.member!.id,
      reviewedAt: input.status === "pending" ? null : new Date(),
    }).returning();

    await writeAuthorityAudit({
      actor: req.member,
      authority: "goodness.review",
      action: "review_goodness_criterion",
      targetType: "work_order",
      targetId: input.workOrderId,
      reason: input.notes,
      metadata: { criterionId: input.criterionId, criterionKey: criterion.key, status: input.status },
    });
    res.status(201).json(created);
  });
}
