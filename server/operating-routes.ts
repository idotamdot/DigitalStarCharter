import type { Express } from "express";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { db } from "./db";
import { requireAuth } from "./auth";
import {
  getAccessSnapshot,
  memberHasCapability,
  requireCapability,
  writeAuthorityAudit,
} from "./access-control";
import {
  aiDecisions,
  authorityAuditLog,
  charterRoles,
  distributionPeriods,
  growthPlans,
  insertAiDecisionSchema,
  insertCharterRoleSchema,
  insertGrowthPlanSchema,
  insertLedgerEntrySchema,
  insertRoleAssignmentSchema,
  insertWorkOrderSchema,
  ledgerEntries,
  memberDistributions,
  roleAssignments,
  workOrders,
  type OperatingDomain,
  type WorkOrderStatus,
} from "@shared/operating-schema";
import { members } from "@shared/identity-schema";

interface RoleSeed {
  name: string;
  domain: OperatingDomain;
  description: string;
  revenueResponsibility: string;
}

const defaultRoles: readonly RoleSeed[] = [
  {
    name: "Coordinator / Secretary",
    domain: "people",
    description: "Owns scheduling, records, follow-through, communications, handoffs and organizational continuity.",
    revenueResponsibility: "Protects billable time, prevents dropped commitments and coordinates human work.",
  },
  {
    name: "Sales & Partnerships",
    domain: "work",
    description: "Finds aligned clients, partnerships and revenue opportunities without extractive sales practices.",
    revenueResponsibility: "Owns qualified pipeline and closed revenue.",
  },
  {
    name: "Client Success",
    domain: "work",
    description: "Turns commitments into excellent client experiences and repeat business.",
    revenueResponsibility: "Owns retention, referrals and expansion revenue.",
  },
  {
    name: "Production / Delivery",
    domain: "work",
    description: "Produces the goods, services and deliverables promised to customers.",
    revenueResponsibility: "Owns direct fulfillment of revenue work.",
  },
  {
    name: "Quality Steward",
    domain: "quality",
    description: "Maintains the non-negotiable quality bar and can stop substandard output from shipping.",
    revenueResponsibility: "Protects reputation, retention and remediation cost.",
  },
  {
    name: "Finance Steward",
    domain: "finance",
    description: "Maintains books, reconciliations, reserves and transparent financial reporting.",
    revenueResponsibility: "Protects solvency and prepares distributions for human approval.",
  },
  {
    name: "Operations Steward",
    domain: "work",
    description: "Improves throughput, procurement, capacity and internal systems.",
    revenueResponsibility: "Reduces avoidable cost and increases delivery capacity.",
  },
  {
    name: "Growth Steward",
    domain: "growth",
    description: "Models sustainable expansion and verifies that the network can support each proposed permanent member.",
    revenueResponsibility: "Prevents growth from outrunning payroll and reserve capacity.",
  },
];

const roleUpdateSchema = insertCharterRoleSchema.partial().extend({
  reason: z.string().trim().min(1).optional(),
});

const assignmentStatusSchema = z.object({
  status: z.enum(["active", "paused", "ended"]),
  notes: z.string().nullable().optional(),
  reason: z.string().trim().min(1).optional(),
});

const workStatusSchema = z.object({
  status: z.enum(["planned", "ready", "in_progress", "blocked", "human_review", "completed", "cancelled"]),
  actualRevenueCents: z.number().int().nonnegative().optional(),
});

const distributionCalculationSchema = z.object({
  name: z.string().trim().min(1).optional(),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  reserveRate: z.number().min(0).max(1).default(0.2),
});

const distributionReviewSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  reason: z.string().trim().min(1).optional(),
});

const growthReviewSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  reason: z.string().trim().min(1).optional(),
  overrideUnsafe: z.boolean().default(false),
});

const aiReviewSchema = z.object({
  status: z.enum(["approved", "modified", "rejected"]),
  reviewNotes: z.string().nullable().optional(),
});

const executeSchema = z.object({
  reason: z.string().trim().min(1).optional(),
});

const memberWorkStatuses = new Set<WorkOrderStatus>(["in_progress", "blocked", "human_review", "completed"]);
const stewardWorkStatuses = new Set<WorkOrderStatus>([
  "planned",
  "ready",
  "in_progress",
  "blocked",
  "human_review",
  "completed",
  "cancelled",
]);

export function registerOperatingRoutes(app: Express) {
  app.post("/api/operating/bootstrap", requireAuth, requireCapability("admin"), async (req, res) => {
    const existing = await db.select().from(charterRoles).limit(1);
    if (existing.length === 0) {
      await db.insert(charterRoles).values(defaultRoles.map((role) => ({
        ...role,
        humanAuthority: true,
        active: true,
      })));
      await writeAuthorityAudit({
        actor: req.member,
        authority: "admin",
        action: "bootstrap_roles",
        targetType: "charter_roles",
      });
    }
    res.json({ ok: true });
  });

  app.get("/api/operating/summary", requireAuth, async (req, res) => {
    const access = await getAccessSnapshot(req.member!);
    const [roles, assignments, work, ledger, growth, decisions, people, distributions] = await Promise.all([
      db.select().from(charterRoles).orderBy(charterRoles.id),
      db.select().from(roleAssignments).orderBy(desc(roleAssignments.assignedAt)),
      db.select().from(workOrders).orderBy(desc(workOrders.createdAt)),
      db.select().from(ledgerEntries).orderBy(desc(ledgerEntries.occurredAt)).limit(100),
      db.select().from(growthPlans).orderBy(desc(growthPlans.createdAt)).limit(20),
      db.select().from(aiDecisions).orderBy(desc(aiDecisions.createdAt)).limit(50),
      db.select({ id: members.id, displayName: members.displayName, email: members.email }).from(members),
      db.select().from(distributionPeriods).orderBy(desc(distributionPeriods.createdAt)).limit(20),
    ]);

    const totals = ledger.reduce((acc, entry) => {
      if (entry.type === "income") acc.incomeCents += entry.amountCents;
      if (entry.type === "expense") acc.expenseCents += entry.amountCents;
      if (entry.type === "reserve") acc.reserveCents += entry.amountCents;
      return acc;
    }, { incomeCents: 0, expenseCents: 0, reserveCents: 0 });

    res.json({
      access,
      roles,
      assignments,
      work,
      ledger,
      growth,
      decisions,
      distributions,
      people: people.map((person) => access.isAdmin
        ? person
        : { id: person.id, displayName: person.displayName }),
      totals,
    });
  });

  app.get("/api/operating/audit", requireAuth, requireCapability("admin"), async (_req, res) => {
    const entries = await db.select().from(authorityAuditLog).orderBy(desc(authorityAuditLog.createdAt)).limit(200);
    res.json(entries);
  });

  app.post("/api/operating/roles", requireAuth, requireCapability("admin"), async (req, res) => {
    const input = insertCharterRoleSchema.parse(req.body);
    const [created] = await db.insert(charterRoles).values(input).returning();
    await writeAuthorityAudit({
      actor: req.member,
      authority: "admin",
      action: "create_role",
      targetType: "charter_role",
      targetId: created.id,
    });
    res.status(201).json(created);
  });

  app.patch("/api/operating/roles/:id", requireAuth, requireCapability("admin"), async (req, res) => {
    const id = Number(req.params.id);
    const { reason, ...changes } = roleUpdateSchema.parse(req.body);
    const [updated] = await db.update(charterRoles).set(changes).where(eq(charterRoles.id, id)).returning();
    if (!updated) return res.status(404).json({ message: "Role not found" });
    await writeAuthorityAudit({
      actor: req.member,
      authority: "admin",
      action: "update_role",
      targetType: "charter_role",
      targetId: id,
      reason,
    });
    res.json(updated);
  });

  app.post("/api/operating/assignments", requireAuth, requireCapability("roles.assign"), async (req, res) => {
    const input = insertRoleAssignmentSchema.parse(req.body);
    const [created] = await db.insert(roleAssignments).values(input).returning();
    await writeAuthorityAudit({
      actor: req.member,
      authority: "roles.assign",
      action: "assign_role",
      targetType: "role_assignment",
      targetId: created.id,
    });
    res.status(201).json(created);
  });

  app.patch("/api/operating/assignments/:id/status", requireAuth, requireCapability("roles.assign"), async (req, res) => {
    const id = Number(req.params.id);
    const input = assignmentStatusSchema.parse(req.body);
    const [updated] = await db.update(roleAssignments).set({
      status: input.status,
      notes: input.notes,
    }).where(eq(roleAssignments.id, id)).returning();
    if (!updated) return res.status(404).json({ message: "Assignment not found" });
    await writeAuthorityAudit({
      actor: req.member,
      authority: "roles.assign",
      action: "change_assignment_status",
      targetType: "role_assignment",
      targetId: id,
      reason: input.reason,
      metadata: { status: input.status },
    });
    res.json(updated);
  });

  app.post("/api/operating/work", requireAuth, requireCapability("work.create"), async (req, res) => {
    const requestedAssignee = req.body && typeof req.body === "object" && "assignedMemberId" in req.body
      ? Number((req.body as Record<string, unknown>).assignedMemberId)
      : null;

    if (requestedAssignee && requestedAssignee !== req.member!.id && !(await memberHasCapability(req.member!, "work.assign"))) {
      return res.status(403).json({ message: "Work steward authority is required to assign work to another member" });
    }

    const input = insertWorkOrderSchema.parse({
      ...req.body,
      createdByMemberId: req.member!.id,
    });
    const [created] = await db.insert(workOrders).values(input).returning();
    await writeAuthorityAudit({
      actor: req.member,
      authority: "work.create",
      action: "create_work_order",
      targetType: "work_order",
      targetId: created.id,
    });
    res.status(201).json(created);
  });

  app.patch("/api/operating/work/:id/status", requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    const input = workStatusSchema.parse(req.body);
    const [work] = await db.select().from(workOrders).where(eq(workOrders.id, id)).limit(1);
    if (!work) return res.status(404).json({ message: "Work order not found" });

    const canManageAny = await memberHasCapability(req.member!, "work.assign");
    const isAssignee = work.assignedMemberId === req.member!.id;
    if (!canManageAny && !isAssignee) {
      return res.status(403).json({ message: "You may only update work assigned to you" });
    }

    const allowedStatuses = canManageAny ? stewardWorkStatuses : memberWorkStatuses;
    if (!allowedStatuses.has(input.status)) {
      return res.status(400).json({ message: "Invalid work status for your authority" });
    }

    const completedAt = input.status === "completed"
      ? new Date()
      : input.status === "planned" || input.status === "ready"
        ? null
        : work.completedAt;

    const [updated] = await db.update(workOrders).set({
      status: input.status,
      completedAt,
      actualRevenueCents: input.actualRevenueCents ?? work.actualRevenueCents,
    }).where(eq(workOrders.id, id)).returning();

    await writeAuthorityAudit({
      actor: req.member,
      authority: canManageAny ? "work.assign" : "member",
      action: "update_work_status",
      targetType: "work_order",
      targetId: id,
      metadata: { status: input.status },
    });
    res.json(updated);
  });

  app.post("/api/operating/ledger", requireAuth, requireCapability("finance.record"), async (req, res) => {
    const input = insertLedgerEntrySchema.parse({
      ...req.body,
      recordedByMemberId: req.member!.id,
    });
    const [created] = await db.insert(ledgerEntries).values(input).returning();
    await writeAuthorityAudit({
      actor: req.member,
      authority: "finance.record",
      action: "record_ledger_entry",
      targetType: "ledger_entry",
      targetId: created.id,
    });
    res.status(201).json(created);
  });

  app.post("/api/operating/distributions/calculate", requireAuth, requireCapability("finance.record"), async (req, res) => {
    const input = distributionCalculationSchema.parse(req.body);
    if (input.periodStart >= input.periodEnd) {
      return res.status(400).json({ message: "Distribution period end must be after its start" });
    }

    const entries = await db.select().from(ledgerEntries).where(and(
      gte(ledgerEntries.occurredAt, input.periodStart),
      lte(ledgerEntries.occurredAt, input.periodEnd),
    ));
    const revenueCents = entries.filter((entry) => entry.type === "income").reduce((n, entry) => n + entry.amountCents, 0);
    const operatingCostsCents = entries.filter((entry) => entry.type === "expense").reduce((n, entry) => n + entry.amountCents, 0);
    const surplus = Math.max(0, revenueCents - operatingCostsCents);
    const reserveContributionCents = Math.round(surplus * input.reserveRate);
    const distributableCents = Math.max(0, surplus - reserveContributionCents);

    const [period] = await db.insert(distributionPeriods).values({
      name: input.name ?? `${input.periodStart.toISOString().slice(0, 10)} distribution`,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      revenueCents,
      operatingCostsCents,
      reserveContributionCents,
      distributableCents,
      status: "human_review",
    }).returning();

    const activeMembers = await db.select({ memberId: roleAssignments.memberId })
      .from(roleAssignments)
      .where(eq(roleAssignments.status, "active"));
    const uniqueMemberIds = [...new Set(activeMembers.map((member) => member.memberId))];

    if (uniqueMemberIds.length > 0 && distributableCents > 0) {
      const equalShare = Math.floor(distributableCents / uniqueMemberIds.length);
      await db.insert(memberDistributions).values(uniqueMemberIds.map((memberId) => ({
        periodId: period.id,
        memberId,
        amountCents: equalShare,
        basis: "equal_share",
        status: "proposed",
      })));
    }

    await writeAuthorityAudit({
      actor: req.member,
      authority: "finance.record",
      action: "calculate_distribution",
      targetType: "distribution_period",
      targetId: period.id,
      metadata: { reserveRate: input.reserveRate, distributableCents },
    });
    res.status(201).json(period);
  });

  app.post("/api/operating/distributions/:id/review", requireAuth, requireCapability("finance.distribute"), async (req, res) => {
    const id = Number(req.params.id);
    const input = distributionReviewSchema.parse(req.body);
    const [updated] = await db.update(distributionPeriods).set({
      status: input.status,
      approvedByMemberId: input.status === "approved" ? req.member!.id : null,
      approvedAt: input.status === "approved" ? new Date() : null,
    }).where(eq(distributionPeriods.id, id)).returning();
    if (!updated) return res.status(404).json({ message: "Distribution period not found" });

    await db.update(memberDistributions).set({ status: input.status }).where(eq(memberDistributions.periodId, id));
    await writeAuthorityAudit({
      actor: req.member,
      authority: "finance.distribute",
      action: "review_distribution",
      targetType: "distribution_period",
      targetId: id,
      reason: input.reason,
      metadata: { status: input.status },
    });
    res.json(updated);
  });

  app.post("/api/operating/growth/evaluate", requireAuth, requireCapability("growth.evaluate"), async (req, res) => {
    const input = insertGrowthPlanSchema.parse(req.body);
    const reserveMonths = Number(input.requiredReserveMonths ?? 6);
    const postHireMonthlyCosts = input.recurringMonthlyCostsCents + input.monthlyCompensationCents;
    const monthlyMargin = input.recurringMonthlyRevenueCents - postHireMonthlyCosts;
    const requiredReserveCents = Math.round(postHireMonthlyCosts * reserveMonths);
    const safeToAdd = monthlyMargin >= 0 && input.currentCashCents >= requiredReserveCents;
    const analysis = {
      postHireMonthlyCosts,
      monthlyMargin,
      requiredReserveCents,
      reserveMonths,
      rules: [
        "Recurring revenue must cover post-hire recurring costs",
        "Cash reserve must cover the configured downside runway",
        "The plan remains advisory until a human administrator approves it",
      ],
    };
    const [created] = await db.insert(growthPlans).values({
      ...input,
      safeToAdd,
      analysis,
      status: "human_review",
    }).returning();

    await writeAuthorityAudit({
      actor: req.member,
      authority: "growth.evaluate",
      action: "evaluate_growth",
      targetType: "growth_plan",
      targetId: created.id,
      metadata: { safeToAdd },
    });
    res.status(201).json(created);
  });

  app.post("/api/operating/growth/:id/review", requireAuth, requireCapability("growth.approve"), async (req, res) => {
    const id = Number(req.params.id);
    const input = growthReviewSchema.parse(req.body);
    const [plan] = await db.select().from(growthPlans).where(eq(growthPlans.id, id)).limit(1);
    if (!plan) return res.status(404).json({ message: "Growth plan not found" });

    if (input.status === "approved" && !plan.safeToAdd && !input.overrideUnsafe) {
      return res.status(409).json({
        message: "This growth plan fails the financial safety gate. Explicit administrator override is required.",
      });
    }
    if (input.status === "approved" && !plan.safeToAdd && input.overrideUnsafe && !input.reason) {
      return res.status(400).json({ message: "An override reason is required for an unsafe growth approval" });
    }

    const [updated] = await db.update(growthPlans).set({
      status: input.status,
      approvedByMemberId: input.status === "approved" ? req.member!.id : null,
      approvedAt: input.status === "approved" ? new Date() : null,
    }).where(eq(growthPlans.id, id)).returning();

    await writeAuthorityAudit({
      actor: req.member,
      authority: "growth.approve",
      action: input.overrideUnsafe ? "override_growth_safety_gate" : "review_growth",
      targetType: "growth_plan",
      targetId: id,
      reason: input.reason,
      metadata: { status: input.status, safeToAdd: plan.safeToAdd, overrideUnsafe: input.overrideUnsafe },
    });
    res.json(updated);
  });

  app.post("/api/operating/ai-decisions", requireAuth, requireCapability("ai.propose"), async (req, res) => {
    const input = insertAiDecisionSchema.parse({
      ...req.body,
      status: "human_review",
      proposedBy: `human:${req.member!.email}`,
    });
    const [created] = await db.insert(aiDecisions).values(input).returning();
    await writeAuthorityAudit({
      actor: req.member,
      authority: "ai.propose",
      action: "submit_management_proposal",
      targetType: "ai_decision",
      targetId: created.id,
    });
    res.status(201).json(created);
  });

  app.post("/api/operating/ai-decisions/:id/review", requireAuth, requireCapability("ai.review"), async (req, res) => {
    const id = Number(req.params.id);
    const input = aiReviewSchema.parse(req.body);
    const [updated] = await db.update(aiDecisions).set({
      status: input.status,
      reviewedByMemberId: req.member!.id,
      reviewedAt: new Date(),
      reviewNotes: input.reviewNotes ?? null,
    }).where(eq(aiDecisions.id, id)).returning();
    if (!updated) return res.status(404).json({ message: "Decision not found" });

    await writeAuthorityAudit({
      actor: req.member,
      authority: "ai.review",
      action: "review_management_proposal",
      targetType: "ai_decision",
      targetId: id,
      reason: input.reviewNotes,
      metadata: { status: input.status },
    });
    res.json(updated);
  });

  app.post("/api/operating/ai-decisions/:id/execute", requireAuth, requireCapability("ai.execute"), async (req, res) => {
    const id = Number(req.params.id);
    const input = executeSchema.parse(req.body ?? {});
    const [decision] = await db.select().from(aiDecisions).where(eq(aiDecisions.id, id)).limit(1);
    if (!decision) return res.status(404).json({ message: "Decision not found" });
    if (!["approved", "modified"].includes(decision.status)) {
      return res.status(409).json({ message: "Only a human-approved proposal may be executed" });
    }

    const [updated] = await db.update(aiDecisions).set({
      status: "executed",
      executedByMemberId: req.member!.id,
      executedAt: new Date(),
    }).where(eq(aiDecisions.id, id)).returning();

    await writeAuthorityAudit({
      actor: req.member,
      authority: "ai.execute",
      action: "execute_approved_proposal",
      targetType: "ai_decision",
      targetId: id,
      reason: input.reason,
    });
    res.json(updated);
  });
}
