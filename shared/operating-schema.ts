import { boolean, integer, jsonb, numeric, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema";

export const charterRoles = pgTable("charter_roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  domain: text("domain").notNull(),
  description: text("description").notNull(),
  revenueResponsibility: text("revenue_responsibility"),
  humanAuthority: boolean("human_authority").default(true).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const roleAssignments = pgTable("role_assignments", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").references(() => charterRoles.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  status: text("status").default("active").notNull(),
  compensationCentsMonthly: integer("compensation_cents_monthly").default(0).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  notes: text("notes"),
});

export const workOrders = pgTable("work_orders", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  revenueType: text("revenue_type").default("direct").notNull(),
  expectedRevenueCents: integer("expected_revenue_cents").default(0).notNull(),
  actualRevenueCents: integer("actual_revenue_cents").default(0).notNull(),
  assignedUserId: integer("assigned_user_id").references(() => users.id),
  assignedRoleId: integer("assigned_role_id").references(() => charterRoles.id),
  status: text("status").default("planned").notNull(),
  dueAt: timestamp("due_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ledgerEntries = pgTable("charter_ledger_entries", {
  id: serial("id").primaryKey(),
  occurredAt: timestamp("occurred_at").defaultNow().notNull(),
  type: text("type").notNull(),
  category: text("category").notNull(),
  amountCents: integer("amount_cents").notNull(),
  description: text("description").notNull(),
  workOrderId: integer("work_order_id").references(() => workOrders.id),
  recordedByUserId: integer("recorded_by_user_id").references(() => users.id),
  source: text("source").default("manual").notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
});

export const distributionPeriods = pgTable("distribution_periods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  revenueCents: integer("revenue_cents").default(0).notNull(),
  operatingCostsCents: integer("operating_costs_cents").default(0).notNull(),
  reserveContributionCents: integer("reserve_contribution_cents").default(0).notNull(),
  distributableCents: integer("distributable_cents").default(0).notNull(),
  status: text("status").default("draft").notNull(),
  approvedByUserId: integer("approved_by_user_id").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const memberDistributions = pgTable("member_distributions", {
  id: serial("id").primaryKey(),
  periodId: integer("period_id").references(() => distributionPeriods.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  amountCents: integer("amount_cents").notNull(),
  basis: text("basis").default("equal_share").notNull(),
  status: text("status").default("proposed").notNull(),
  paidAt: timestamp("paid_at"),
});

export const growthPlans = pgTable("growth_plans", {
  id: serial("id").primaryKey(),
  proposedRoleName: text("proposed_role_name").notNull(),
  monthlyCompensationCents: integer("monthly_compensation_cents").notNull(),
  currentCashCents: integer("current_cash_cents").default(0).notNull(),
  recurringMonthlyRevenueCents: integer("recurring_monthly_revenue_cents").default(0).notNull(),
  recurringMonthlyCostsCents: integer("recurring_monthly_costs_cents").default(0).notNull(),
  requiredReserveMonths: numeric("required_reserve_months").default("6").notNull(),
  safeToAdd: boolean("safe_to_add").default(false).notNull(),
  analysis: jsonb("analysis").default({}).notNull(),
  status: text("status").default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  approvedByUserId: integer("approved_by_user_id").references(() => users.id),
  approvedAt: timestamp("approved_at"),
});

export const aiDecisions = pgTable("ai_decisions", {
  id: serial("id").primaryKey(),
  domain: text("domain").notNull(),
  actionType: text("action_type").notNull(),
  title: text("title").notNull(),
  recommendation: text("recommendation").notNull(),
  rationale: text("rationale").notNull(),
  confidence: numeric("confidence").default("0").notNull(),
  expectedImpact: jsonb("expected_impact").default({}).notNull(),
  riskFlags: jsonb("risk_flags").default([]).notNull(),
  consequenceLevel: text("consequence_level").default("low").notNull(),
  status: text("status").default("drafted").notNull(),
  proposedBy: text("proposed_by").default("ai-management").notNull(),
  reviewedByUserId: integer("reviewed_by_user_id").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  executedAt: timestamp("executed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCharterRoleSchema = createInsertSchema(charterRoles).omit({ id: true, createdAt: true });
export const insertRoleAssignmentSchema = createInsertSchema(roleAssignments).omit({ id: true, assignedAt: true });
export const insertWorkOrderSchema = createInsertSchema(workOrders).omit({ id: true, createdAt: true, completedAt: true });
export const insertLedgerEntrySchema = createInsertSchema(ledgerEntries).omit({ id: true, occurredAt: true });
export const insertDistributionPeriodSchema = createInsertSchema(distributionPeriods).omit({ id: true, approvedAt: true, createdAt: true });
export const insertGrowthPlanSchema = createInsertSchema(growthPlans).omit({ id: true, safeToAdd: true, analysis: true, approvedAt: true, createdAt: true });
export const insertAiDecisionSchema = createInsertSchema(aiDecisions).omit({ id: true, reviewedAt: true, executedAt: true, createdAt: true });

export type CharterRole = typeof charterRoles.$inferSelect;
export type RoleAssignment = typeof roleAssignments.$inferSelect;
export type WorkOrder = typeof workOrders.$inferSelect;
export type LedgerEntry = typeof ledgerEntries.$inferSelect;
export type DistributionPeriod = typeof distributionPeriods.$inferSelect;
export type MemberDistribution = typeof memberDistributions.$inferSelect;
export type GrowthPlan = typeof growthPlans.$inferSelect;
export type AiDecision = typeof aiDecisions.$inferSelect;

export type InsertCharterRole = z.infer<typeof insertCharterRoleSchema>;
export type InsertRoleAssignment = z.infer<typeof insertRoleAssignmentSchema>;
export type InsertWorkOrder = z.infer<typeof insertWorkOrderSchema>;
export type InsertLedgerEntry = z.infer<typeof insertLedgerEntrySchema>;
export type InsertDistributionPeriod = z.infer<typeof insertDistributionPeriodSchema>;
export type InsertGrowthPlan = z.infer<typeof insertGrowthPlanSchema>;
export type InsertAiDecision = z.infer<typeof insertAiDecisionSchema>;
