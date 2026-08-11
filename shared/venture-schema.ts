import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type {
  ConfidenceAssessment,
  FeasibilityDimensionFinding,
  GoodnessCriterionFinding,
  MoneyAmount,
} from "./venture-domain";

export const actorKindEnum = pgEnum("actor_kind", [
  "person",
  "organization",
  "ai",
  "system",
]);

export const evidenceKindEnum = pgEnum("evidence_kind", [
  "fact",
  "estimate",
  "assumption",
  "testimony",
  "ai_hypothesis",
]);

export const feasibilityRecommendationEnum = pgEnum("feasibility_recommendation", [
  "viable",
  "viable_with_changes",
  "experimental",
  "not_presently_viable",
  "fails_goodness_gate",
]);

export const goodnessOutcomeEnum = pgEnum("goodness_outcome", [
  "pass",
  "pass_with_conditions",
  "revise",
  "block",
]);

export const charterStatusEnum = pgEnum("charter_status", [
  "draft",
  "review",
  "approved",
  "superseded",
  "rejected",
]);

export const ventureStatusEnum = pgEnum("venture_status", [
  "prelaunch",
  "launching",
  "operating",
  "paused",
  "closed",
]);

export const leaseStatusEnum = pgEnum("lease_status", [
  "draft",
  "active",
  "past_due",
  "suspended",
  "terminated",
]);

export const actors = pgTable("actors", {
  id: uuid("id").defaultRandom().primaryKey(),
  kind: actorKindEnum("kind").notNull(),
  displayName: text("display_name").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const personas = pgTable("personas", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  archetype: text("archetype").notNull(),
  ageContext: text("age_context"),
  workContext: text("work_context"),
  incomeContext: text("income_context"),
  locationContext: text("location_context"),
  painPoints: jsonb("pain_points").$type<readonly string[]>().notNull().default([]),
  goals: jsonb("goals").$type<readonly string[]>().notNull().default([]),
  vulnerabilities: jsonb("vulnerabilities").$type<readonly string[]>().notNull().default([]),
  accessibilityConsiderations: jsonb("accessibility_considerations").$type<readonly string[]>().notNull().default([]),
  sourceLabel: text("source_label"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const needs = pgTable("needs", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  affectedPopulation: text("affected_population").notNull(),
  location: text("location"),
  urgency: text("urgency").notNull(),
  createdByActorId: uuid("created_by_actor_id").references(() => actors.id).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const opportunities = pgTable("opportunities", {
  id: uuid("id").defaultRandom().primaryKey(),
  needId: uuid("need_id").references(() => needs.id).notNull(),
  title: text("title").notNull(),
  proposedValue: text("proposed_value").notNull(),
  beneficiaryDescription: text("beneficiary_description").notNull(),
  payerDescription: text("payer_description"),
  constraints: jsonb("constraints").$type<readonly string[]>().notNull().default([]),
  lifecycleStage: text("lifecycle_stage").notNull().default("opportunity"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const evidenceItems = pgTable("evidence_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  needId: uuid("need_id").references(() => needs.id),
  opportunityId: uuid("opportunity_id").references(() => opportunities.id),
  kind: evidenceKindEnum("kind").notNull(),
  claim: text("claim").notNull(),
  sourceLabel: text("source_label"),
  sourceReference: text("source_reference"),
  observedAt: timestamp("observed_at", { withTimezone: true }),
  suppliedBy: text("supplied_by").notNull(),
  confidence: jsonb("confidence").$type<ConfidenceAssessment>().notNull(),
  contradictionNotes: jsonb("contradiction_notes").$type<readonly string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const feasibilityAssessments = pgTable("feasibility_assessments", {
  id: uuid("id").defaultRandom().primaryKey(),
  opportunityId: uuid("opportunity_id").references(() => opportunities.id).notNull(),
  recommendation: feasibilityRecommendationEnum("recommendation").notNull(),
  executiveSummary: text("executive_summary").notNull(),
  estimatedStartupCost: jsonb("estimated_startup_cost").$type<MoneyAmount>(),
  estimatedMonthlyOperatingCost: jsonb("estimated_monthly_operating_cost").$type<MoneyAmount>(),
  estimatedBreakEvenMonthlyRevenue: jsonb("estimated_break_even_monthly_revenue").$type<MoneyAmount>(),
  unresolvedQuestions: jsonb("unresolved_questions").$type<readonly string[]>().notNull().default([]),
  assumptions: jsonb("assumptions").$type<readonly string[]>().notNull().default([]),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const feasibilityFindings = pgTable("feasibility_findings", {
  id: uuid("id").defaultRandom().primaryKey(),
  assessmentId: uuid("assessment_id").references(() => feasibilityAssessments.id).notNull(),
  dimension: text("dimension").$type<FeasibilityDimensionFinding["dimension"]>().notNull(),
  finding: text("finding").notNull(),
  confidence: jsonb("confidence").$type<ConfidenceAssessment>().notNull(),
  supportingEvidenceIds: jsonb("supporting_evidence_ids").$type<readonly string[]>().notNull().default([]),
  risks: jsonb("risks").$type<readonly string[]>().notNull().default([]),
  mitigations: jsonb("mitigations").$type<readonly string[]>().notNull().default([]),
});

export const charters = pgTable("charters", {
  id: uuid("id").defaultRandom().primaryKey(),
  opportunityId: uuid("opportunity_id").references(() => opportunities.id).notNull(),
  currentVersion: integer("current_version").notNull().default(1),
  status: charterStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const charterVersions = pgTable("charter_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  charterId: uuid("charter_id").references(() => charters.id).notNull(),
  version: integer("version").notNull(),
  problemStatement: text("problem_statement").notNull(),
  beneficiaries: text("beneficiaries").notNull(),
  valueProposition: text("value_proposition").notNull(),
  productOrServiceDefinition: text("product_or_service_definition").notNull(),
  ownershipAssumptions: text("ownership_assumptions").notNull(),
  governanceRules: jsonb("governance_rules").$type<readonly string[]>().notNull().default([]),
  revenueModel: jsonb("revenue_model").$type<{ model: string; explanation: string }>().notNull(),
  pricingPrinciples: jsonb("pricing_principles").$type<readonly string[]>().notNull().default([]),
  launchConstraints: jsonb("launch_constraints").$type<readonly string[]>().notNull().default([]),
  targetOutcomes: jsonb("target_outcomes").$type<readonly string[]>().notNull().default([]),
  unacceptableHarms: jsonb("unacceptable_harms").$type<readonly string[]>().notNull().default([]),
  goodnessCommitments: jsonb("goodness_commitments").$type<readonly string[]>().notNull().default([]),
  humanDecisionAuthorities: jsonb("human_decision_authorities").$type<readonly string[]>().notNull().default([]),
  aiDelegationBoundaries: jsonb("ai_delegation_boundaries").$type<readonly string[]>().notNull().default([]),
  portabilityCommitments: jsonb("portability_commitments").$type<readonly string[]>().notNull().default([]),
  approvedByActorId: uuid("approved_by_actor_id").references(() => actors.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const goodnessReviews = pgTable("goodness_reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  subjectType: text("subject_type").notNull(),
  subjectId: text("subject_id").notNull(),
  outcome: goodnessOutcomeEnum("outcome").notNull(),
  findings: jsonb("findings").$type<readonly GoodnessCriterionFinding[]>().notNull().default([]),
  humanApprovalRequired: boolean("human_approval_required").notNull().default(false),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }).defaultNow().notNull(),
  reviewedByActorId: uuid("reviewed_by_actor_id").references(() => actors.id),
});

export const ventures = pgTable("ventures", {
  id: uuid("id").defaultRandom().primaryKey(),
  charterId: uuid("charter_id").references(() => charters.id).notNull(),
  legalName: text("legal_name"),
  operatingName: text("operating_name").notNull(),
  status: ventureStatusEnum("status").notNull().default("prelaunch"),
  primaryOperatorActorId: uuid("primary_operator_actor_id").references(() => actors.id).notNull(),
  launchedAt: timestamp("launched_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const ventureBrands = pgTable("venture_brands", {
  ventureId: uuid("venture_id").references(() => ventures.id).primaryKey(),
  brandName: text("brand_name").notNull(),
  tagline: text("tagline"),
  domain: text("domain"),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color"),
  secondaryColor: text("secondary_color"),
  typography: text("typography"),
  voiceDescription: text("voice_description"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const ventureRoles = pgTable("venture_roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  ventureId: uuid("venture_id").references(() => ventures.id).notNull(),
  title: text("title").notNull(),
  mission: text("mission").notNull(),
  requiredOutcomes: jsonb("required_outcomes").$type<readonly string[]>().notNull().default([]),
  capabilities: jsonb("capabilities").$type<readonly string[]>().notNull().default([]),
  requiredCredentials: jsonb("required_credentials").$type<readonly string[]>().notNull().default([]),
  workArrangement: text("work_arrangement").notNull(),
  expectedWeeklyHours: numeric("expected_weekly_hours", { precision: 5, scale: 2 }),
  compensationDescription: text("compensation_description").notNull(),
  locationConstraint: text("location_constraint"),
  decisionAuthority: jsonb("decision_authority").$type<readonly string[]>().notNull().default([]),
  aiDelegableResponsibilities: jsonb("ai_delegable_responsibilities").$type<readonly string[]>().notNull().default([]),
  humanJudgmentResponsibilities: jsonb("human_judgment_responsibilities").$type<readonly string[]>().notNull().default([]),
  escalationResponsibilities: jsonb("escalation_responsibilities").$type<readonly string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const candidateMatches = pgTable("candidate_matches", {
  id: uuid("id").defaultRandom().primaryKey(),
  roleId: uuid("role_id").references(() => ventureRoles.id).notNull(),
  candidateActorId: uuid("candidate_actor_id").references(() => actors.id).notNull(),
  fitScore: numeric("fit_score", { precision: 5, scale: 2 }).notNull(),
  strengths: jsonb("strengths").$type<readonly string[]>().notNull().default([]),
  gaps: jsonb("gaps").$type<readonly string[]>().notNull().default([]),
  explanation: text("explanation").notNull(),
  requiresHumanDecision: boolean("requires_human_decision").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const aiRoles = pgTable("ai_roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  ventureId: uuid("venture_id").references(() => ventures.id).notNull(),
  name: text("name").notNull(),
  mission: text("mission").notNull(),
  allowedCapabilities: jsonb("allowed_capabilities").$type<readonly string[]>().notNull().default([]),
  prohibitedActions: jsonb("prohibited_actions").$type<readonly string[]>().notNull().default([]),
  spendingBoundary: jsonb("spending_boundary").$type<MoneyAmount>(),
  dataBoundaries: jsonb("data_boundaries").$type<readonly string[]>().notNull().default([]),
  escalationThresholds: jsonb("escalation_thresholds").$type<readonly string[]>().notNull().default([]),
  requiredHumanApproverRoleIds: jsonb("required_human_approver_role_ids").$type<readonly string[]>().notNull().default([]),
  qualityMetrics: jsonb("quality_metrics").$type<readonly string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const enterpriseLeases = pgTable("enterprise_leases", {
  id: uuid("id").defaultRandom().primaryKey(),
  ventureId: uuid("venture_id").references(() => ventures.id).notNull(),
  status: leaseStatusEnum("status").notNull().default("draft"),
  launchFee: jsonb("launch_fee").$type<MoneyAmount>(),
  monthlyBaseFee: jsonb("monthly_base_fee").$type<MoneyAmount>().notNull(),
  whiteGloveOperationsFee: jsonb("white_glove_operations_fee").$type<MoneyAmount>(),
  dataPortabilityIncluded: boolean("data_portability_included").notNull().default(true),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  terminatedAt: timestamp("terminated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cappedSuccessPricing = pgTable("capped_success_pricing", {
  leaseId: uuid("lease_id").references(() => enterpriseLeases.id).primaryKey(),
  revenueShareBasisPoints: integer("revenue_share_basis_points").notNull(),
  repaymentCap: jsonb("repayment_cap").$type<MoneyAmount>().notNull(),
  collectedToDate: jsonb("collected_to_date").$type<MoneyAmount>().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  perpetualClaimAllowed: boolean("perpetual_claim_allowed").notNull().default(false),
});

export const operationalMetrics = pgTable("operational_metrics", {
  id: uuid("id").defaultRandom().primaryKey(),
  ventureId: uuid("venture_id").references(() => ventures.id).notNull(),
  metricKey: text("metric_key").notNull(),
  label: text("label").notNull(),
  unit: text("unit").notNull(),
  value: numeric("value", { precision: 20, scale: 6 }).notNull(),
  observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
  source: text("source").notNull(),
});

export const ventureEvents = pgTable("venture_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  ventureId: uuid("venture_id").references(() => ventures.id).notNull(),
  eventType: text("event_type").notNull(),
  summary: text("summary").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
  actorId: uuid("actor_id").references(() => actors.id),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
});

export const outcomes = pgTable("outcomes", {
  id: uuid("id").defaultRandom().primaryKey(),
  ventureId: uuid("venture_id").references(() => ventures.id).notNull(),
  outcomeKey: text("outcome_key").notNull(),
  description: text("description").notNull(),
  value: numeric("value", { precision: 20, scale: 6 }),
  unit: text("unit"),
  beneficiaryGroup: text("beneficiary_group"),
  observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
  evidenceIds: jsonb("evidence_ids").$type<readonly string[]>().notNull().default([]),
});

export const learningFindings = pgTable("learning_findings", {
  id: uuid("id").defaultRandom().primaryKey(),
  ventureId: uuid("venture_id").references(() => ventures.id),
  opportunityId: uuid("opportunity_id").references(() => opportunities.id),
  title: text("title").notNull(),
  finding: text("finding").notNull(),
  evidenceIds: jsonb("evidence_ids").$type<readonly string[]>().notNull().default([]),
  confidence: jsonb("confidence").$type<ConfidenceAssessment>().notNull(),
  reusable: boolean("reusable").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
