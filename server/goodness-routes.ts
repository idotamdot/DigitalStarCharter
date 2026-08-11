import type { Express } from "express";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "./db";
import { requireAuth } from "./auth";
import { requireCapability, writeAuthorityAudit } from "./access-control";
import {
  goodnessCriteria,
  goodnessReviewInputSchema,
  goodnessReviews,
  goodnessSubjectInputSchema,
  goodnessSubjects,
} from "@shared/goodness-schema";
import {
  ensureDefaultGoodnessCriteria,
  ensureGoodnessStewardRole,
  ensureGoodnessSubject,
  ensureWorkGoodnessSubject,
  evaluateGoodnessSubject,
} from "./goodness-service";

export function registerGoodnessRoutes(app: Express): void {
  app.post("/api/goodness/bootstrap", requireAuth, requireCapability("goodness.manage"), async (req, res) => {
    const [criteria, role] = await Promise.all([
      ensureDefaultGoodnessCriteria(req.member!.id),
      ensureGoodnessStewardRole(),
    ]);
    await writeAuthorityAudit({ actor: req.member, authority: "goodness.manage", action: "bootstrap_goodness_system", targetType: "goodness", metadata: { criterionCount: criteria.length, goodnessStewardRoleId: role.id } });
    res.json({ ok: true, criterionCount: criteria.length, goodnessStewardRoleId: role.id });
  });

  app.get("/api/goodness/criteria", requireAuth, async (_req, res) => {
    res.json(await db.select().from(goodnessCriteria).orderBy(goodnessCriteria.id));
  });

  app.get("/api/goodness/subjects", requireAuth, async (_req, res) => {
    res.json(await db.select().from(goodnessSubjects).orderBy(desc(goodnessSubjects.updatedAt)));
  });

  app.post("/api/goodness/subjects", requireAuth, requireCapability("goodness.review"), async (req, res) => {
    const input = goodnessSubjectInputSchema.parse(req.body as unknown);
    const subject = await ensureGoodnessSubject({ ...input, createdByMemberId: req.member!.id });
    await writeAuthorityAudit({ actor: req.member, authority: "goodness.review", action: "register_goodness_subject", targetType: input.subjectType, targetId: input.sourceId, metadata: { goodnessSubjectId: subject.id } });
    res.status(201).json(subject);
  });

  app.get("/api/goodness/subjects/:subjectId", requireAuth, async (req, res) => {
    const subjectId = z.coerce.number().int().positive().parse(req.params.subjectId);
    const [subject] = await db.select().from(goodnessSubjects).where(eq(goodnessSubjects.id, subjectId)).limit(1);
    if (!subject) return res.status(404).json({ message: "Goodness subject not found" });
    const [criteria, reviews, gate] = await Promise.all([
      db.select().from(goodnessCriteria).where(eq(goodnessCriteria.active, true)).orderBy(goodnessCriteria.id),
      db.select().from(goodnessReviews).where(eq(goodnessReviews.subjectId, subjectId)).orderBy(desc(goodnessReviews.createdAt)),
      evaluateGoodnessSubject(subjectId),
    ]);
    res.json({ subject, criteria, reviews, gate });
  });

  app.get("/api/goodness/work/:workOrderId", requireAuth, async (req, res) => {
    const workOrderId = z.coerce.number().int().positive().parse(req.params.workOrderId);
    const subject = await ensureWorkGoodnessSubject(workOrderId);
    const [criteria, reviews, gate] = await Promise.all([
      db.select().from(goodnessCriteria).where(eq(goodnessCriteria.active, true)).orderBy(goodnessCriteria.id),
      db.select().from(goodnessReviews).where(eq(goodnessReviews.subjectId, subject.id)).orderBy(desc(goodnessReviews.createdAt)),
      evaluateGoodnessSubject(subject.id),
    ]);
    res.json({ subject, criteria, reviews, gate });
  });

  app.post("/api/goodness/reviews", requireAuth, requireCapability("goodness.review"), async (req, res) => {
    const input = goodnessReviewInputSchema.parse(req.body as unknown);
    const [subject] = await db.select().from(goodnessSubjects).where(eq(goodnessSubjects.id, input.subjectId)).limit(1);
    if (!subject) return res.status(404).json({ message: "Goodness subject not found" });
    const [criterion] = await db.select().from(goodnessCriteria).where(eq(goodnessCriteria.id, input.criterionId)).limit(1);
    if (!criterion) return res.status(404).json({ message: "Goodness criterion not found" });
    if (!criterion.active) return res.status(409).json({ message: "Inactive Goodness criteria cannot be reviewed" });

    const [created] = await db.insert(goodnessReviews).values({ ...input, reviewerMemberId: req.member!.id, reviewedAt: input.status === "pending" ? null : new Date() }).returning();
    await writeAuthorityAudit({
      actor: req.member,
      authority: "goodness.review",
      action: "review_goodness_criterion",
      targetType: subject.subjectType,
      targetId: subject.sourceId,
      reason: input.notes,
      metadata: { goodnessSubjectId: subject.id, criterionId: input.criterionId, criterionKey: criterion.key, status: input.status },
    });
    res.status(201).json(created);
  });
}
