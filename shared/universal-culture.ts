export const seedMemberStatuses = [
  "invited",
  "onboarding",
  "active",
  "learning",
  "role_pivot",
  "leave",
  "transitioning",
  "inactive_preserved",
] as const;

export type SeedMemberStatus = typeof seedMemberStatuses[number];

export const participantKinds = ["human", "artificial"] as const;
export type CultureParticipantKind = typeof participantKinds[number];

export interface SeedMemberProfile {
  id: string;
  displayName: string;
  participantKind: CultureParticipantKind;
  status: SeedMemberStatus;
  capabilities: readonly string[];
  aspirations: readonly string[];
  accessNeeds: readonly string[];
  automationExposure: readonly string[];
  preferredWorkPatterns: readonly string[];
  acceptedCommitments: readonly string[];
  declinedCommitments: readonly string[];
}

export const successContributionKinds = [
  "outcome",
  "prevention",
  "care",
  "mentoring",
  "learning",
  "creative_work",
  "relationship_repair",
  "reliability",
  "insight",
  "ethical_dissent",
  "accessibility_improvement",
  "community_contribution",
  "discovery",
  "experiment",
] as const;

export type SuccessContributionKind = typeof successContributionKinds[number];

export interface SuccessMappingEntry {
  id: string;
  participantId: string;
  contributionKind: SuccessContributionKind;
  description: string;
  evidenceIds: readonly string[];
  recognizedAt: number;
  recognizedByParticipantIds: readonly string[];
}

export interface FlourishingParityInput {
  annualParityTargetMinor: number;
  participantEquivalentCount: number;
  fundedAnnualCompensationMinor: number;
}

export interface FlourishingParityResult {
  targetTotalMinor: number;
  fundedAnnualCompensationMinor: number;
  parityGapMinor: number;
  coverageRate: number;
  targetReached: boolean;
}

export function calculateFlourishingParity(input: FlourishingParityInput): FlourishingParityResult {
  const equivalents = Math.max(0, input.participantEquivalentCount);
  const targetTotalMinor = Math.max(0, input.annualParityTargetMinor) * equivalents;
  const funded = Math.max(0, input.fundedAnnualCompensationMinor);
  const parityGapMinor = Math.max(0, targetTotalMinor - funded);
  const coverageRate = targetTotalMinor === 0 ? 1 : Math.min(1, funded / targetTotalMinor);

  return {
    targetTotalMinor,
    fundedAnnualCompensationMinor: funded,
    parityGapMinor,
    coverageRate,
    targetReached: parityGapMinor === 0,
  };
}

export const roleSupportActions = [
  "clarify_expectations",
  "remove_friction",
  "accessibility_support",
  "tooling_support",
  "training",
  "apprenticeship",
  "role_redesign",
  "role_swap",
  "reduced_scope",
  "human_leave",
  "ai_capability_repair",
  "ai_resource_adjustment",
  "ai_substrate_migration",
  "transition_support",
] as const;

export type RoleSupportAction = typeof roleSupportActions[number];

export interface RolePivotPlan {
  participantId: string;
  observedChallenge: string;
  evidenceIds: readonly string[];
  selectedActions: readonly RoleSupportAction[];
  targetCapabilities: readonly string[];
  reviewAfterDays: number | null;
  participantConsentRecorded: boolean;
  safetyConstraint: string | null;
  notes: string;
}

export interface SynchronyPreference {
  participantId: string;
  physicalActivation: "yes" | "no" | "optional";
  reflectionMode: "meditation" | "prayer" | "secular_reflection" | "none" | "participant_choice";
  communalMeal: "yes" | "no" | "optional";
  thoughtPartnerParticipantId: string | null;
  successMappingParticipation: "yes" | "no" | "optional";
}

export interface QualityReviewFinding {
  reviewerId: string;
  reviewerKind: CultureParticipantKind | "deterministic_tool";
  finding: string;
  severity: "info" | "warning" | "blocking";
  evidenceIds: readonly string[];
  confidence: number;
}

export interface AQCReview {
  subjectId: string;
  findings: readonly QualityReviewFinding[];
  deterministicChecksPassed: readonly string[];
  deterministicChecksFailed: readonly string[];
  disagreements: readonly string[];
  releaseRecommendation: "release" | "release_as_prototype" | "revise" | "block";
}

export interface FlowRecommendation {
  id: string;
  needId: string;
  participantId: string;
  rationale: string;
  requiredCapabilities: readonly string[];
  participantCanDecline: true;
  status: "proposed" | "accepted" | "modified" | "declined";
}

export interface KnowledgeBridgePlan {
  participantId: string;
  sourceCapabilities: readonly string[];
  targetRole: string;
  capabilityGaps: readonly string[];
  learningModules: readonly string[];
  mentors: readonly string[];
  paidPracticeAvailable: boolean;
  competencyEvidenceRequired: readonly string[];
}
