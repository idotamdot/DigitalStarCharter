import type { Express } from "express";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "./db";
import { requireAdmin, requireAuth } from "./auth";
import {
  aiDecisions,
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
  ["Coordinator / Secretary", "people", "Keeps the organization coherent: scheduling, records, follow-through, communications and handoffs.", "Protects billable time and converts opportunities into completed work."],
  ["Sales & Partnerships", "work", "Finds aligned clients, partnerships and revenue opportunities without extractive sales practices.", "Owns qualified pipeline and closed revenue."],
  ["Client Success", "work", "Turns commitments into excellent client experiences and repeat business.", "Retention, referrals and expansion revenue."],
  ["Production / Delivery", "work", "Produces the goods, services and deliverables promised to customers.", "Direct fulfillment of revenue work."],
  ["Quality Steward", "quality", "Maintains the non-negotiable quality bar and stops substandard output from shipping.", "Protects reputation, retention and warranty cost."],
  ["Finance Steward", "finance", "Maintains books, cash controls, reserves, distributions and transparent financial reporting.", "Protects solvency and fair distribution."],
  ["Operations Steward", "work", "Improves throughput, procurement, capacity and internal systems.", "Reduces avoidable cost and increases delivery capacity."],
  ["Growth Steward", "growth", "Models sustainable expansion and verifies that the network can support each new permanent member.", "Prevents growth from outrunning payroll capacity."],
] as const;

export function registerOperatingRoutes(app: Express) {
  app.post("/api/operating/bootstrap", requireAdmin, async (_req, res) => {
    const existing = await db.select().from(charterRoles).limit(1);
    if (existing.length === 0) {
      await db.insert(charterRoles).values(defaultRoles.map(([name, domain, description, revenueResponsibility]) => ({
        name, domain, description, revenueResponsibility, humanAuthority: true, active: true,
      })));
    }
    res.json({ ok: true });
  });

  app.get("/api/operating/summary", requireAuth, async (_req, res) => {
    const [roles, assignments, work, ledger, growth, decisions, people] = await Promise.all([
      db.select().from(charterRoles).orderBy(charterRoles.id),
      db.select().from(roleAssignments).orderBy(desc(roleAssignments.assignedAt)),
      db.select().from(workOrders).orderBy(desc(workOrders.createdAt)),
      db.select().from(ledgerEntries).orderBy(desc(ledgerEntries.occurredAt)).limit(100),
      db.select().from(growthPlans).orderBy(desc(growthPlans.createdAt)).limit(20),
      db.select().from(aiDecisions).orderBy(desc(aiDecisions.createdAt)).limit(50),
      db.select({ id: users.id, fullName: users.fullName, email: users.email }).from(users),
    ]);

    const totals = ledger.reduce((acc, entry) => {
      if (entry.type === "income") acc.incomeCents += entry.amountCents;
      if (entry.type === "expense") acc.expenseCents += entry.amountCents;
      if (entry.type === "reserve") acc.reserveCents += entry.amountCents;
      return acc;
    }, { incomeCents: 0, expenseCents: 0, reserveCents: 0 });

    res.json({ roles, assignments, work, ledger, growth, decisions, people, totals });
  });

  app.post("/api/operating/roles", requireAdmin, async (req, res) => {
    const input = insertCharterRoleSchema.parse(req.body);
    const [created] = await db.insert(charterRoles).values(input).returning();
    res.status(201).json(created);
  });

  app.post("/api/operating/assignments", requireAdmin, async (req, res) => {
    const input = insertRoleAssignmentSchema.parse(req.body);
    const [created] = await db.insert(roleAssignments).values(input).returning();
    res.status(201).json(created);
  });

  app.post("/api/operating/work", requireAuth, async (req, res) => {
    const input = insertWorkOrderSchema.parse(req.body);
    const [created] = await db.insert(workOrders).values(input).returning();
    res.status(201).json(created);
  });

  app.patch("/api/operating/work/:id/status", requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    const status = String(req.body.status || "");
    const completedAt = status === "completed" ? new Date() : null;
    const [updated] = await db.update(workOrders).set({ status, completedAt }).where(eq(workOrders.id, id)).returning();
    res.json(updated);
  });

  app.post("/api/operating/ledger", requireAdmin, async (req, res) => {
    const input = insertLedgerEntrySchema.parse({ ...req.body, recordedByUserId: req.user!.id });
    const [created] = await db.insert(ledgerEntries).values(input).returning();
    res.status(201).json(created);
  });

  app.post("/api/operating/distributions/calculate", requireAdmin, async (req, res) => {
    const periodStart = new Date(req.body.periodStart);
    const periodEnd = new Date(req.body.periodEnd);
    const reserveRate = Math.min(1, Math.max(0, Number(req.body.reserveRate ?? 0.2)));

    const entries = await db.select().from(ledgerEntries).where(and(
      gte(ledgerEntries.occurredAt, periodStart),
      lte(ledgerEntries.occurredAt, periodEnd),
    ));
    const revenueCents = entries.filter((e) => e.type === "income").reduce((n, e) => n + e.amountCents, 0);
    const operatingCostsCents = entries.filter((e) => e.type === "expense").reduce((n, e) => n + e.amountCents, 0);
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

    const activeMembers = await db.select({ userId: roleAssignments.userId })
      .from(roleAssignments)
      .where(eq(roleAssignments.status, "active"));
    const uniqueUserIds = [...new Set(activeMembers.map((m) => m.userId))];
    if (uniqueUserIds.length > 0 && distributableCents > 0) {
      const equalShare = Math.floor(distributableCents / uniqueUserIds.length);
      await db.insert(memberDistributions).values(uniqueUserIds.map((userId) => ({
        periodId: period.id, userId, amountCents: equalShare, basis: "equal_share", status: "proposed",
      })));
    }

    res.status(201).json(period);
  });

  app.post("/api/operating/growth/evaluate", requireAuth, async (req, res) => {
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
      rules: ["Recurring revenue covers post-hire recurring costs", "Cash reserve covers required downside runway"],
    };
    const [created] = await db.insert(growthPlans).values({ ...input, safeToAdd, analysis, status: "human_review" }).returning();
    res.status(201).json(created);
  });

  app.post("/api/operating/ai-decisions", requireAuth, async (req, res) => {
    const input = insertAiDecisionSchema.parse({ ...req.body, status: "human_review" });
    const [created] = await db.insert(aiDecisions).values(input).returning();
    res.status(201).json(created);
  });

  app.post("/api/operating/ai-decisions/:id/review", requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const status = String(req.body.status || "rejected");
    if (!["approved", "modified", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid review status" });
    }
    const [updated] = await db.update(aiDecisions).set({
      status,
      reviewedByUserId: req.user!.id,
      reviewedAt: new Date(),
      reviewNotes: req.body.reviewNotes ? String(req.body.reviewNotes) : null,
    }).where(eq(aiDecisions.id, id)).returning();
    res.json(updated);
  });
}
