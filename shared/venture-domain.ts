export const feasibilityRecommendations = [
  "viable",
  "viable_with_changes",
  "experimental",
  "not_presently_viable",
  "fails_goodness_gate",
] as const;

export type FeasibilityRecommendation = typeof feasibilityRecommendations[number];

export const goodnessOutcomes = [
  "pass",
  "pass_with_conditions",
  "revise",
  "block",
] as const;

export type GoodnessOutcome = typeof goodnessOutcomes[number];

export const evidenceKinds = [
  "fact",
  "estimate",
  "assumption",
  "testimony",
  "ai_hypothesis",
] as const;

export type EvidenceKind = typeof evidenceKinds[number];

export const lifecycleStages = [
  "need",
  "evidence",
  "opportunity",
  "feasibility",
  "charter",
  "goodness",
  "team",
  "lease",
  "launch",
  "operations",
  "outcomes",
  "learning",
] as const;

export type LifecycleStage = typeof lifecycleStages[number];

export interface MoneyAmount {
  currency: string;
  amountMinor: number;
}

export interface ConfidenceAssessment {
  score: number;
  rationale: string;
}

export interface PersonaPerspective {
  id: string;
  name: string;
  archetype: string;
  ageContext: string | null;
  workContext: string | null;
  incomeContext: string | null;
  locationContext: string | null;
  painPoints: readonly string[];
  goals: readonly string[];
  vulnerabilities: readonly string[];
  accessibilityConsiderations: readonly string[];
}

export interface NeedDefinition {
  id: string;
  title: string;
  description: string;
  affectedPopulation: string;
  location: string | null;
  urgency: "low" | "moderate" | "high" | "critical";
  createdByActorId: string;
  createdAt: string;
}

export interface EvidenceItem {
  id: string;
  needId: string | null;
  opportunityId: string | null;
  kind: EvidenceKind;
  claim: string;
  sourceLabel: string | null;
  sourceReference: string | null;
  observedAt: string | null;
  suppliedBy: string;
  confidence: ConfidenceAssessment;
  contradictionNotes: readonly string[];
  createdAt: string;
}

export interface OpportunityDefinition {
  id: string;
  needId: string;
  title: string;
  proposedValue: string;
  beneficiaryDescription: string;
  payerDescription: string | null;
  constraints: readonly string[];
  stage: LifecycleStage;
  createdAt: string;
  updatedAt: string;
}

export interface FeasibilityDimensionFinding {
  dimension:
    | "demand"
    | "affordability"
    | "competition"
    | "differentiation"
    | "startup_cost"
    | "operating_cost"
    | "staffing"
    | "technology"
    | "compliance"
    | "capital"
    | "utilization"
    | "margin"
    | "break_even"
    | "runway"
    | "downside"
    | "implementation"
    | "environment"
    | "community"
    | "persona_impact"
    | "goodness";
  finding: string;
  confidence: ConfidenceAssessment;
  supportingEvidenceIds: readonly string[];
  risks: readonly string[];
  mitigations: readonly string[];
}

export interface FeasibilityAssessment {
  id: string;
  opportunityId: string;
  recommendation: FeasibilityRecommendation;
  executiveSummary: string;
  findings: readonly FeasibilityDimensionFinding[];
  estimatedStartupCost: MoneyAmount | null;
  estimatedMonthlyOperatingCost: MoneyAmount | null;
  estimatedBreakEvenMonthlyRevenue: MoneyAmount | null;
  unresolvedQuestions: readonly string[];
  assumptions: readonly string[];
  completedAt: string;
}

export interface GoodnessCriterionFinding {
  criterionId: string;
  criterion: string;
  passes: boolean;
  rationale: string;
  affectedPersonaIds: readonly string[];
  conditions: readonly string[];
}

export interface GoodnessReview {
  id: string;
  subjectType:
    | "opportunity"
    | "charter"
    | "charter_amendment"
    | "pricing"
    | "product"
    | "policy"
    | "automation";
  subjectId: string;
  outcome: GoodnessOutcome;
  findings: readonly GoodnessCriterionFinding[];
  reviewedAt: string;
  humanApprovalRequired: boolean;
}

export interface RevenueModelDefinition {
  model: "direct_sale" | "subscription" | "managed_lease" | "usage" | "capped_success_pricing" | "hybrid";
  explanation: string;
}

export interface CharterDefinition {
  id: string;
  opportunityId: string;
  currentVersion: number;
  status: "draft" | "review" | "approved" | "superseded" | "rejected";
}

export interface CharterVersionDefinition {
  id: string;
  charterId: string;
  version: number;
  problemStatement: string;
  beneficiaries: string;
  valueProposition: string;
  productOrServiceDefinition: string;
  ownershipAssumptions: string;
  governanceRules: readonly string[];
  revenueModel: RevenueModelDefinition;
  pricingPrinciples: readonly string[];
  launchConstraints: readonly string[];
  targetOutcomes: readonly string[];
  unacceptableHarms: readonly string[];
  goodnessCommitments: readonly string[];
  humanDecisionAuthorities: readonly string[];
  aiDelegationBoundaries: readonly string[];
  portabilityCommitments: readonly string[];
  approvedByActorId: string | null;
  createdAt: string;
}

export interface VentureRoleDefinition {
  id: string;
  charterId: string;
  title: string;
  mission: string;
  requiredOutcomes: readonly string[];
  capabilities: readonly string[];
  requiredCredentials: readonly string[];
  workArrangement: "onsite" | "hybrid" | "remote" | "flexible";
  expectedWeeklyHours: number | null;
  compensationDescription: string;
  locationConstraint: string | null;
  decisionAuthority: readonly string[];
  aiDelegableResponsibilities: readonly string[];
  humanJudgmentResponsibilities: readonly string[];
  escalationResponsibilities: readonly string[];
}

export interface CandidateMatchExplanation {
  candidateActorId: string;
  roleId: string;
  fitScore: number;
  strengths: readonly string[];
  gaps: readonly string[];
  explanation: string;
  requiresHumanDecision: true;
}

export interface AiRoleDefinition {
  id: string;
  ventureId: string;
  name: string;
  mission: string;
  allowedCapabilities: readonly string[];
  prohibitedActions: readonly string[];
  spendingBoundary: MoneyAmount | null;
  dataBoundaries: readonly string[];
  escalationThresholds: readonly string[];
  requiredHumanApproverRoleIds: readonly string[];
  qualityMetrics: readonly string[];
}

export interface VentureDefinition {
  id: string;
  charterId: string;
  legalName: string | null;
  operatingName: string;
  status: "prelaunch" | "launching" | "operating" | "paused" | "closed";
  primaryOperatorActorId: string;
  launchedAt: string | null;
}

export interface VentureBrandDefinition {
  ventureId: string;
  brandName: string;
  tagline: string | null;
  domain: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  typography: string | null;
  voiceDescription: string | null;
}

export interface EnterpriseLeaseDefinition {
  id: string;
  ventureId: string;
  status: "draft" | "active" | "past_due" | "suspended" | "terminated";
  launchFee: MoneyAmount | null;
  monthlyBaseFee: MoneyAmount;
  whiteGloveOperationsFee: MoneyAmount | null;
  startedAt: string;
  terminatedAt: string | null;
  dataPortabilityIncluded: true;
}

export interface CappedSuccessPricingDefinition {
  leaseId: string;
  revenueShareBasisPoints: number;
  repaymentCap: MoneyAmount;
  collectedToDate: MoneyAmount;
  expiresAt: string | null;
  perpetualClaimAllowed: false;
}

export interface OperationalMetricDefinition {
  id: string;
  ventureId: string;
  metricKey: string;
  label: string;
  unit: string;
  value: number;
  observedAt: string;
  source: "system" | "integration" | "human_verified";
}

export interface VentureOutcomeDefinition {
  id: string;
  ventureId: string;
  outcomeKey: string;
  description: string;
  value: number | null;
  unit: string | null;
  beneficiaryGroup: string | null;
  observedAt: string;
  evidenceIds: readonly string[];
}
