import { integer, jsonb, numeric, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { members } from "./identity-schema";
import { aiDecisions, type ConsequenceLevel, type OperatingDomain } from "./operating-schema";

export const managementRunStatusSchema = z.enum(["running", "completed", "failed"]);
export type ManagementRunStatus = z.infer<typeof managementRunStatusSchema>;

export const managementRunModeSchema = z.enum(["deterministic", "hybrid"]);
export type ManagementRunMode = z.infer<typeof managementRunModeSchema>;

export const managementFindingSeveritySchema = z.enum(["info", "low", "medium", "high", "critical"]);
export type ManagementFindingSeverity = z.infer<typeof managementFindingSeveritySchema>;

export interface ManagementMetric {
  name: string;
  value: number;
  unit: "count" | "cents" | "percent" | "months" | "hours" | "days";
}

export interface ManagementEvidenceItem {
  source: "members" | "member_profiles" | "roles" | "work" | "accounting" | "quality" | "learning" | "growth";
  fact: string;
  recordIds?: number[];
  metrics?: ManagementMetric[];
}

export interface ManagementSnapshot {
  capturedAt: string;
  activeMemberCount: number;
  activeAssignmentCount: number;
  unassignedMemberCount: number;
  activeWorkCount: number;
  blockedWorkCount: number;
  overdueWorkCount: number;
  unassignedReadyWorkCount: number;
  openQualityBlockCount: number;
  activeLearningEnrollmentCount: number;
  revenueLast30DaysCents: number;
  expenseLast30DaysCents: number;
  operatingCashCents: number;
  reserveCashCents: number;
  reserveRunwayMonths: number | null;
  workPerActiveMember: number;
}

export const aiManagementRuns = pgTable("ai_management_runs", {
  id: serial("id").primaryKey(),
  status: text("status").$type<ManagementRunStatus>().default("running").notNull(),
  mode: text("mode").$type<ManagementRunMode>().default("deterministic").notNull(),
  requestedByMemberId: integer("requested_by_member_id").references(() => members.id, { onDelete: "set null" }),
  provider: text("provider").default("rules").notNull(),
  model: text("model"),
  snapshot: jsonb("snapshot").$type<ManagementSnapshot>(),
  executiveSummary: text("executive_summary"),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const aiManagerFindings = pgTable("ai_manager_findings", {
  id: serial("id").primaryKey(),
  runId: integer("run_id").references(() => aiManagementRuns.id, { onDelete: "cascade" }).notNull(),
  domain: text("domain").$type<OperatingDomain>().notNull(),
  findingType: text("finding_type").notNull(),
  severity: text("severity").$type<ManagementFindingSeverity>().notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  recommendation: text("recommendation").notNull(),
  rationale: text("rationale").notNull(),
  confidence: numeric("confidence").notNull(),
  consequenceLevel: text("consequence_level").$type<ConsequenceLevel>().default("low").notNull(),
  evidence: jsonb("evidence").$type<ManagementEvidenceItem[]>().default([]).notNull(),
  decisionId: integer("decision_id").references(() => aiDecisions.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertManagementRunSchema = createInsertSchema(aiManagementRuns, {
  status: managementRunStatusSchema,
  mode: managementRunModeSchema,
}).omit({ id: true, startedAt: true, completedAt: true });

export const insertManagementFindingSchema = createInsertSchema(aiManagerFindings, {
  severity: managementFindingSeveritySchema,
}).omit({ id: true, createdAt: true });

export type AiManagementRun = typeof aiManagementRuns.$inferSelect;
export type AiManagerFinding = typeof aiManagerFindings.$inferSelect;
export type InsertManagementFinding = z.infer<typeof insertManagementFindingSchema>;
