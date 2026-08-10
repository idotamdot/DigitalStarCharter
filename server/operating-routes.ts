import type { Express } from "express";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "./db";
import { requireAuth } from "./auth";
import {
  getAccessSnapshot,
  requireCapability,
  userHasCapability,
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
} from "@shared/operating-schema";
import { users } from "@shared/schema";

const defaultRoles = [
  ["Coordinator / Secretary", "people", "Owns scheduling, records, follow-through, communications, handoffs and organizational continuity.", "Protects billable time, prevents dropped commitments and coordinates human work."],
  ["Sales & Partnerships", "work", "Finds aligned clients, partnerships and revenue opportunities without extractive sales practices.", "Owns qualified pipeline and closed revenue."],
  ["Client Success", "work", "Turns commitments into excellent client experiences and repeat business.", "Owns retention, referrals and expansion revenue."],
  ["Production / Delivery", "work", "Produces the goods, services and deliverables promised to customers.", "Owns direct fulfillment of revenue work."],
  ["Quality Steward", "quality", "Maintains the non-negotiable quality bar and can stop substandard output from shipping.", "Protects reputation, retention and remediation cost."],
  ["Finance Steward", "finance", "Maintains books, reconciliations, reserves and transparent financial reporting.", "Protects solvency and prepares distributions for human approval."],
  ["Operations Steward", "work", "Improves throughput, procurement, capacity and internal systems.", "Reduces avoidable cost and increases delivery capacity."],
  ["Growth Steward", "growth", "Models sustainable expansion and verifies that the network can support each proposed permanent member.", "Prevents growth from outrunning payroll and reserve capacity."],
] as const;

const memberWorkStatuses = new Set(["in_progress", "blocked", "completed"]);
const stewardWorkStatuses = new Set(["planned", "assigned", "in_progress", "blocked", "completed", "cancelled"]);

export function registerOperatingRoutes(app: Express) {
  app.post("/api/operating/bootstrap", requireAuth, requireCapability("admin"), async (req, res) => {
    const existing = await db.select().from(charterRoles).limit(1);
    if (existing.length === 0) {
      await db.insert(charterRoles).values(defaultRoles.map(([name, domain, description, revenueResponsibility]) => ({
        name,
        domain,
        description,
        revenueResponsibility,
        humanAuthority: true,
        active: true,
      })));
      await writeAuthorityAudit({ actor: req.user, authority: "admin", action: "bootstrap_roles", targetType: "charter_roles" });
    }
    res.json({ ok: true });
  });

  app.get("/api/operating/summary", requireAuth, async (req, res) => {
    const access = await getAccessSnapshot(req.user!);
    const [roles, assignments, work, ledger, growth, decisions, people, distributions] = await Promise.all([
      db.select().from(charterRoles).orderBy(charterRoles.id),
      db.select().from(roleAssignments).orderBy(desc(roleAssignments.assignedAt)),
      db.select().from(workOrders).orderBy(desc(workOrders.createdAt)),
      db.select().from(ledgerEntries).orderBy(desc(ledgerEntries.occurredAt)).limit(100),
      db.select().from(growthPlans).orderBy(desc(growthPlans.createdAt)).limit(20),
      db.select().from(aiDecisions).orderBy(desc(aiDecisions.createdAt)).limit(50),
      db.select({ id: users.id, fullName: users.fullName, email: users.email }).from(users),
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
      people: people.map((person) => access.isAdmin ? person : ({ id: person.id, fullName: person.fullName })),
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
    await writeAuthorityAudit({ actor: req.user, authority: "admin", action: "create_role", targetType: "charter_role", targetId: created.id });
    res.status(201).json(created);
  });

  app.patch("/api/operating/roles/:id", requireAuth, requireCapability("admin"), async (req, res) => {
    const id = Number(req.params.id);
    const allowed = (({ name, domain, description, revenueResponsibility, humanAuthority, active }) => ({
      name, domain, description, revenueResponsibility, humanAuthority, active,
    }))(req.body);
    const [updated] = await db.update(charterRoles).set(allowed).where(eq(charterRoles.id, id)).returning();
    if (!updated) return res.status(404).json({ message: "Role not found" });
    await writeAuthorityAudit({ actor: req.user, authority: "admin", action: "update_role", targetType: "charter_role", targetId: id, reason: req.body.reason });
    res.json(updated);
  });

  app.post("/api/operating/assignments", requireAuth, requireCapability("roles.assign"), async (req, res) => {
    const input = insertRoleAssignmentSchema.parse(req.body);
    const [created] = await db.insert(roleAssignments).values(input).returning();
    await writeAuthorityAudit({ actor: req.user, authority: "roles.assign", action: "assign_role", targetType: "role_assignment", targetId: created.id, reason: req.body.reason });
    res.status(201).json(created);
  });

  app.patch("/api/operating/assignments/:id/status", requireAuth, requireCapability("roles.assign"), async (req, res) => {
    const id = Number(req.params.id);
    const status = String(req.body.status || "");
    if (!["active", "inactive", "transitioning"].includes(status)) return res.status(400).json({ message: "Invalid assignment status" });
    const [updated] = await db.update(roleAssignments).set({ status, notes: req.body.notes ?? undefined }).where(eq(roleAssignments.id, id)).returning();
    if (!updated) return res.status(404).json({ message: "Assignment not found" });
    await writeAuthorityAudit({ actor: req.user, authority: "roles.assign", action: "change_assignment_status", targetType: "role_assignment", targetId: id, reason: req.body.reason, metadata: { status } });
    res.json(updated);
  });

  app.post("/api/operating/work", requireAuth, requireCapability("work.create"), async (req, res) => {
    const requestedAssignee = req.body.assignedUserId == null ? null : Number(req.body.assignedUserId);
    if (requestedAssignee && requestedAssignee !== req.user!.id && !(await userHasCapability(req.user!, "work.assign"))) {
      return res.status(403).json({ message: "Work steward authority is required to assign work to another person" });
    }
    const input = insertWorkOrderSchema.parse({ ...req.body, createdByUserId: req.user!.id });
    const [created] = await db.insert(workOrders).values(input).returning();
    await writeAuthorityAudit({ actor: req.user, authority: "work.create", action: "create_work_order", targetType: "work_order", targetId: created.id });
    res.status(201).json(created);
  });

  app.patch("/api/operating/work/:id/status", requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    const [work] = await db.select().from(workOrders).where(eq(workOrders.id, id)).limit(1);
    if (!work) return res.status(404).json({ message: "Work order not found" });

    const canManageAny = await userHasCapability(req.user!, "work.assign");
    const isAssignee = work.assignedUserId === req.user!.id;
    if (!canManageAny && !isAssignee) return res.status(403).json({ message: "You may only update work assigned to you" });

    const status = String(req.body.status || "");
    const allowedStatuses = canManageAny ? stewardWorkStatuses : memberWorkStatuses;
    if (!allowedStatuses.has(status)) return res.status(400).json({ message: "Invalid work status for your authority" });

    const completedAt = status === "completed" ? new Date() : status === "planned" || status === "assigned" ? null : work.completedAt;
    const [updated] = await db.update(workOrders).set({
      status,
      completedAt,
      actualRevenueCents: req.body.actualRevenueCents == null ? work.actualRevenueCents : Number(req.body.actualRevenueCents),
    }).where(eq(workOrders.id, id)).returning();
    await writeAuthorityAudit({ actor: req.user, authority: canManageAny ? "work.assign" : "member", action: "update_work_status", targetType: "work_order", targetId: id, metadata: { status } });
    res.json(updated);
  });

  app.post("/api/operating/ledger", requireAuth, requireCapability("finance.record"), async (req, res) => {
    const input = insertLedgerEntrySchema.parse({ ...req.body, recordedByUserId: req.user!.id });
    const [created] = await db.insert(ledgerEntries).values(input).returning();
    await writeAuthorityAudit({ actor: req.user, authority: "finance.record", action: "record_ledger_entry", targetType: "ledger_entry", targetId: created.id, reason: req.body.reason });
    res.status(201).json(created);
  });

  app.post("/api/operating/distributions/calculate", requireAuth, requireCapability("finance.record"), async (req, res) => {
    const periodStart = new Date(req.body.periodStart);
    const periodEnd = new Date(req.body.periodEnd);
    if (!Number.isFinite(periodStart.getTime()) || !Number.isFinite(periodEnd.getTime()) || periodStart >= periodEnd) {
      return res.status(400).json({ message: "A valid distribution period is required" });
    }

    const reserveRate = Math.min(1, Math.max(0, Number(req.body.reserveRate ?? 0.2)));
    const entries = await db.select().from(ledgerEntries).where(and(
      gte(ledgerEntries.occurredAt, periodStart),
      lte(ledgerEntries.occurredAt, periodEnd),
    ));
    const revenueCents = entries.filter((entry) => entry.type === "income").reduce((n, entry) => n + entry.amountCents, 0);
    const operatingCostsCents = entries.filter((entry) => entry.type === "expense").reduce((n, entry) => n + entry.amountCents, 0);
    const surplus = Math.max(0, revenueCents - operatingCostsCents);
    const reserveContributionCents = Math.round(surplus * reserveRate);
    const distributableCents = Math.max(0, surplus - reserveContributionCents);

    const [period] = await db.insert(distributionPeriods).values({
      name: String(req.body.name || `${periodStart.toISOString().slice(0, 10)} distribution`),
      periodStart,
      periodEnd,
      revenueCents,
      operatingCostsCents,
      reserveContributionCents,
      distributableCents,
      status: "human_review",
    }).returning();

    const activeMembers = await db.select({ userId: roleAssignments.userId }).from(roleAssignments).where(eq(roleAssignments.status, "active"));
    const uniqueUserIds = [...new Set(activeMembers.map((member) => member.userId))];
    if (uniqueUserIds.length > 0 && distributableCents > 0) {
      const equalShare = Math.floor(distributableCents / uniqueUserIds.length);
      await db.insert(memberDistributions).values(uniqueUserIds.map((userId) => ({
        periodId: period.id,
        userId,
        amountCents: equalShare,
        basis: "equal_share",
        status: "proposed",
      })));
    }

    await writeAuthorityAudit({ actor: req.user, authority: "finance.record", action: "calculate_distribution", targetType: "distribution_period", targetId: period.id, metadata: { reserveRate, distributableCents } });
    res.status(201).json(period);
  });

  app.post("/api/operating/distributions/:id/review", requireAuth, requireCapability("finance.distribute"), async (req, res) => {
    const id = Number(req.params.id);
    const status = String(req.body.status || "rejected");
    if (!["approved", "rejected"].includes(status)) return res.status(400).json({ message: "Invalid distribution review status" });
    const [updated] = await db.update(distributionPeriods).set({
      status,
      approvedByUserId: status === "approved" ? req.user!.id : null,
      approvedAt: status === "approved" ? new Date() : null,
    }).where(eq(distributionPeriods.id, id)).returning();
    if (!updated) return res.status(404).json({ message: "Distribution period not found" });
    await db.update(memberDistributions).set({ status }).where(eq(memberDistributions.periodId, id));
    await writeAuthorityAudit({ actor: req.user, authority: "finance.distribute", action: "review_distribution", targetType: "distribution_period", targetId: id, reason: req.body.reason, metadata: { status } });
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
    const [created] = await db.insert(growthPlans).values({ ...input, safeToAdd, analysis, status: "human_review" }).returning();
    await writeAuthorityAudit({ actor: req.user, authority: "growth.evaluate", action: "evaluate_growth", targetType: "growth_plan", targetId: created.id, metadata: { safeToAdd } });
    res.status(201).json(created);
  });

  app.post("/api/operating/growth/:id/review", requireAuth, requireCapability("growth.approve"), async (req, res) => {
    const id = Number(req.params.id);
    const status = String(req.body.status || "rejected");
    if (!["approved", "rejected", "deferred"].includes(status)) return res.status(400).json({ message: "Invalid growth review status" });
    const [updated] = await db.update(growthPlans).set({
      status,
      approvedByUserId: status === "approved" ? req.user!.id : null,
      approvedAt: status === "approved" ? new Date() : null,
    }).where(eq(growthPlans.id, id)).returning();
    if (!updated) return res.status(404).json({ message: "Growth plan not found" });
    await writeAuthorityAudit({ actor: req.user, authority: "growth.approve", action: "review_growth", targetType: "growth_plan", targetId: id, reason: req.body.reason, metadata: { status, safeToAdd: updated.safeToAdd } });
    res.json(updated);
  });

  app.post("/api/operating/ai-decisions", requireAuth, requireCapability("ai.propose"), async (req, res) => {
    const input = insertAiDecisionSchema.parse({
      ...req.body,
      status: "human_review",
      proposedBy: `human:${req.user!.email}`,
    });
    const [created] = await db.insert(aiDecisions).values(input).returning();
    await writeAuthorityAudit({ actor: req.user, authority: "ai.propose", action: "submit_management_proposal", targetType: "ai_decision", targetId: created.id });
    res.status(201).json(created);
  });

  app.post("/api/operating/ai-decisions/:id/review", requireAuth, requireCapability("ai.review"), async (req, res) => {
    const id = Number(req.params.id);
    const status = String(req.body.status || "rejected");
    if (!["approved", "modified", "rejected"].includes(status)) return res.status(400).json({ message: "Invalid review status" });
    const [updated] = await db.update(aiDecisions).set({
      status,
      reviewedByUserId: req.user!.id,
      reviewedAt: new Date(),
      reviewNotes: req.body.reviewNotes ? String(req.body.reviewNotes) : null,
    }).where(eq(aiDecisions.id, id)).returning();
    if (!updated) return res.status(404).json({ message: "Decision not found" });
    await writeAuthorityAudit({ actor: req.user, authority: "ai.review", action: "review_management_proposal", targetType: "ai_decision", targetId: id, reason: req.body.reviewNotes, metadata: { status } });
    res.json(updated);
  });

  app.post("/api/operating/ai-decisions/:id/execute", requireAuth, requireCapability("ai.execute"), async (req, res) => {
    const id = Number(req.params.id);
    const [decision] = await db.select().from(aiDecisions).where(eq(aiDecisions.id, id)).limit(1);
    if (!decision) return res.status(404).json({ message: "Decision not found" });
    if (!["approved", "modified"].includes(decision.status)) return res.status(409).json({ message: "Only a human-approved proposal may be marked executed" });
    const [updated] = await db.update(aiDecisions).set({
      status: "executed",
      executedByUserId: req.user!.id,
      executedAt: new Date(),
    }).where(eq(aiDecisions.id, id)).returning();
    await writeAuthorityAudit({ actor: req.user, authority: "ai.execute", action: "execute_approved_proposal", targetType: "ai_decision", targetId: id, reason: req.body.reason });
    res.json(updated);
  });
}
