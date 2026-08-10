import type { Express } from "express";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "./db";
import { requireAuth } from "./auth";
import { getAccessSnapshot, requireCapability } from "./access-control";
import { members } from "@shared/identity-schema";
import {
  learningEnrollments,
  learningPathSteps,
  learningPaths,
  learningProgress,
  insertLearningPathDbSchema,
  insertLearningPathStepDbSchema,
  type LearningEnrollmentRow,
  type LearningPathRow,
  type LearningPathStepRow,
  type LearningProgressRow,
} from "@shared/learning-schema";
import type {
  LearningEnrollmentApi,
  LearningPathApi,
  LearningPathDetailApi,
  LearningPathStepApi,
  LearningProgressApi,
  LearningTier,
} from "@shared/learning";

const accessRank: Record<LearningTier, number> = {
  open: 0,
  member: 1,
  steward: 2,
};

const progressUpdateSchema = z.object({
  completed: z.boolean(),
  notes: z.string().nullable().optional(),
  resourceRating: z.number().int().min(1).max(5).nullable().optional(),
});

function toPathApi(path: LearningPathRow): LearningPathApi {
  return {
    id: path.id,
    title: path.title,
    description: path.description,
    category: path.category,
    skillLevel: path.skillLevel as LearningPathApi["skillLevel"],
    estimatedHours: path.estimatedHours,
    thumbnailUrl: path.thumbnailUrl,
    tags: path.tags,
    authorMemberId: path.authorMemberId,
    requiredTier: path.requiredTier as LearningTier,
    createdAt: path.createdAt.toISOString(),
    updatedAt: path.updatedAt.toISOString(),
  };
}

function toStepApi(step: LearningPathStepRow, progress?: LearningProgressRow): LearningPathStepApi {
  return {
    id: step.id,
    pathId: step.pathId,
    resourceId: step.resourceId,
    stepOrder: step.stepOrder,
    title: step.title,
    description: step.description,
    estimatedMinutes: step.estimatedMinutes,
    isRequired: step.isRequired,
    completedAt: progress?.completedAt?.toISOString() ?? null,
    resourceRating: progress?.resourceRating ?? null,
  };
}

function toEnrollmentApi(enrollment: LearningEnrollmentRow, path: LearningPathRow | null): LearningEnrollmentApi {
  return {
    id: enrollment.id,
    memberId: enrollment.memberId,
    pathId: enrollment.pathId,
    enrolledAt: enrollment.enrolledAt.toISOString(),
    completedAt: enrollment.completedAt?.toISOString() ?? null,
    isActive: enrollment.isActive,
    progressPercent: enrollment.progressPercent,
    lastAccessedAt: enrollment.lastAccessedAt.toISOString(),
    path: path ? toPathApi(path) : null,
  };
}

async function viewerTier(memberId: number | undefined): Promise<LearningTier> {
  if (!memberId) return "open";
  const [member] = await db.select().from(members).where(eq(members.id, memberId)).limit(1);
  if (!member) return "open";
  const access = await getAccessSnapshot(member);
  return access.capabilities.includes("learning.manage") ? "steward" : "member";
}

function canAccess(path: LearningPathRow, tier: LearningTier): boolean {
  return accessRank[tier] >= accessRank[path.requiredTier as LearningTier];
}

async function updateEnrollmentProgress(memberId: number, pathId: number): Promise<void> {
  const steps = await db.select().from(learningPathSteps).where(eq(learningPathSteps.pathId, pathId));
  const progress = await db.select().from(learningProgress).where(and(
    eq(learningProgress.memberId, memberId),
    eq(learningProgress.pathId, pathId),
  ));

  const completedStepIds = new Set(progress.filter((item) => item.completedAt).map((item) => item.stepId));
  const requiredSteps = steps.filter((step) => step.isRequired);
  const denominator = requiredSteps.length || steps.length;
  const numerator = (requiredSteps.length ? requiredSteps : steps).filter((step) => completedStepIds.has(step.id)).length;
  const progressPercent = denominator === 0 ? 100 : Math.round((numerator / denominator) * 100);

  await db.update(learningEnrollments).set({
    progressPercent,
    completedAt: progressPercent === 100 ? new Date() : null,
    lastAccessedAt: new Date(),
  }).where(and(
    eq(learningEnrollments.memberId, memberId),
    eq(learningEnrollments.pathId, pathId),
  ));
}

export function registerLearningRoutes(app: Express) {
  app.get("/api/learning-paths", async (req, res) => {
    const tier = await viewerTier(req.member?.id);
    const rows = await db.select().from(learningPaths).orderBy(learningPaths.title);
    res.json(rows.filter((path) => canAccess(path, tier)).map(toPathApi));
  });

  app.get("/api/learning-paths/:id", async (req, res) => {
    const pathId = z.coerce.number().int().positive().parse(req.params.id);
    const [path] = await db.select().from(learningPaths).where(eq(learningPaths.id, pathId)).limit(1);
    if (!path) return res.status(404).json({ message: "Learning path not found" });

    const tier = await viewerTier(req.member?.id);
    if (!canAccess(path, tier)) {
      return res.status(req.member ? 403 : 401).json({ message: "This learning path requires member access" });
    }

    const steps = await db.select().from(learningPathSteps).where(eq(learningPathSteps.pathId, pathId)).orderBy(learningPathSteps.stepOrder);
    const memberProgress = req.member
      ? await db.select().from(learningProgress).where(and(
          eq(learningProgress.memberId, req.member.id),
          eq(learningProgress.pathId, pathId),
        ))
      : [];
    const progressByStep = new Map(memberProgress.map((item) => [item.stepId, item]));

    const body: LearningPathDetailApi = {
      ...toPathApi(path),
      steps: steps.map((step) => toStepApi(step, progressByStep.get(step.id))),
    };
    res.json(body);
  });

  app.post("/api/learning-paths", requireAuth, requireCapability("learning.manage"), async (req, res) => {
    const input = insertLearningPathDbSchema.parse({
      ...req.body,
      authorMemberId: req.member!.id,
    });
    const [created] = await db.insert(learningPaths).values(input).returning();
    res.status(201).json(toPathApi(created));
  });

  app.post("/api/learning-paths/:id/steps", requireAuth, requireCapability("learning.manage"), async (req, res) => {
    const pathId = z.coerce.number().int().positive().parse(req.params.id);
    const input = insertLearningPathStepDbSchema.parse({ ...req.body, pathId });
    const [created] = await db.insert(learningPathSteps).values(input).returning();
    res.status(201).json(toStepApi(created));
  });

  app.post("/api/learning-paths/:id/enroll", requireAuth, async (req, res) => {
    const pathId = z.coerce.number().int().positive().parse(req.params.id);
    const [path] = await db.select().from(learningPaths).where(eq(learningPaths.id, pathId)).limit(1);
    if (!path) return res.status(404).json({ message: "Learning path not found" });

    const tier = await viewerTier(req.member!.id);
    if (!canAccess(path, tier)) return res.status(403).json({ message: "You do not have access to this learning path" });

    const [existing] = await db.select().from(learningEnrollments).where(and(
      eq(learningEnrollments.memberId, req.member!.id),
      eq(learningEnrollments.pathId, pathId),
    )).limit(1);
    if (existing) return res.json(toEnrollmentApi(existing, path));

    const [created] = await db.insert(learningEnrollments).values({
      memberId: req.member!.id,
      pathId,
      isActive: true,
    }).returning();
    res.status(201).json(toEnrollmentApi(created, path));
  });

  app.get("/api/member/enrollments", requireAuth, async (req, res) => {
    const enrollments = await db.select().from(learningEnrollments).where(eq(learningEnrollments.memberId, req.member!.id));
    const pathIds = [...new Set(enrollments.map((item) => item.pathId))];
    const allPaths = pathIds.length === 0 ? [] : await db.select().from(learningPaths);
    const pathById = new Map(allPaths.filter((path) => pathIds.includes(path.id)).map((path) => [path.id, path]));
    res.json(enrollments.map((enrollment) => toEnrollmentApi(enrollment, pathById.get(enrollment.pathId) ?? null)));
  });

  app.get("/api/learning-paths/:id/progress", requireAuth, async (req, res) => {
    const pathId = z.coerce.number().int().positive().parse(req.params.id);
    const steps = await db.select().from(learningPathSteps).where(eq(learningPathSteps.pathId, pathId));
    const progress = await db.select().from(learningProgress).where(and(
      eq(learningProgress.memberId, req.member!.id),
      eq(learningProgress.pathId, pathId),
    ));
    const completedSteps = progress.filter((item) => item.completedAt).length;
    const totalSteps = steps.length;
    const body: LearningProgressApi = {
      progress: progress.map((item) => ({
        id: item.id,
        memberId: item.memberId,
        pathId: item.pathId,
        stepId: item.stepId,
        startedAt: item.startedAt.toISOString(),
        completedAt: item.completedAt?.toISOString() ?? null,
        notes: item.notes,
        resourceRating: item.resourceRating,
      })),
      overallProgress: totalSteps === 0 ? 100 : Math.round((completedSteps / totalSteps) * 100),
      totalSteps,
      completedSteps,
    };
    res.json(body);
  });

  app.post("/api/learning-path-steps/:id/progress", requireAuth, async (req, res) => {
    const stepId = z.coerce.number().int().positive().parse(req.params.id);
    const input = progressUpdateSchema.parse(req.body);
    const [step] = await db.select().from(learningPathSteps).where(eq(learningPathSteps.id, stepId)).limit(1);
    if (!step) return res.status(404).json({ message: "Learning step not found" });

    const [enrollment] = await db.select().from(learningEnrollments).where(and(
      eq(learningEnrollments.memberId, req.member!.id),
      eq(learningEnrollments.pathId, step.pathId),
      eq(learningEnrollments.isActive, true),
    )).limit(1);
    if (!enrollment) return res.status(409).json({ message: "Enroll in this learning path before recording progress" });

    const [existing] = await db.select().from(learningProgress).where(and(
      eq(learningProgress.memberId, req.member!.id),
      eq(learningProgress.stepId, stepId),
    )).limit(1);

    const values = {
      completedAt: input.completed ? new Date() : null,
      notes: input.notes ?? existing?.notes ?? null,
      resourceRating: input.resourceRating ?? existing?.resourceRating ?? null,
    };

    const updated = existing
      ? (await db.update(learningProgress).set(values).where(eq(learningProgress.id, existing.id)).returning())[0]
      : (await db.insert(learningProgress).values({
          memberId: req.member!.id,
          pathId: step.pathId,
          stepId,
          ...values,
        }).returning())[0];

    await updateEnrollmentProgress(req.member!.id, step.pathId);
    res.json({
      id: updated.id,
      memberId: updated.memberId,
      pathId: updated.pathId,
      stepId: updated.stepId,
      startedAt: updated.startedAt.toISOString(),
      completedAt: updated.completedAt?.toISOString() ?? null,
      notes: updated.notes,
      resourceRating: updated.resourceRating,
    });
  });
}
