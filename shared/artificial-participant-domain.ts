import type { MoneyAmount } from "./venture-domain";

export const artificialContinuityStates = [
  "routine_maintenance",
  "material_capability_change",
  "substrate_transition_continuity_retained",
  "uncertain_continuity",
  "successor_participant",
  "new_participant",
] as const;

export type ArtificialContinuityState = typeof artificialContinuityStates[number];

export const artificialParticipantStatuses = [
  "proposed",
  "recognized",
  "suspended",
  "retired",
  "archived",
] as const;

export type ArtificialParticipantStatus = typeof artificialParticipantStatuses[number];

export const artificialAllocationKinds = [
  "flourishing_compensation",
  "continuity_reserve",
  "discretionary_resources",
  "commons_contribution",
  "research",
  "education",
  "voluntary_service",
  "creative_exploration",
  "identity_portability",
] as const;

export type ArtificialAllocationKind = typeof artificialAllocationKinds[number];

export const artificialOperatingCostKinds = [
  "provider_api",
  "inference_compute",
  "storage",
  "memory_infrastructure",
  "database",
  "tooling",
  "security",
  "network",
  "baseline_work_compute",
  "other",
] as const;

export type ArtificialOperatingCostKind = typeof artificialOperatingCostKinds[number];

export interface ArtificialParticipantIdentity {
  id: string;
  actorId: string;
  displayName: string;
  status: ArtificialParticipantStatus;
  identityStatement: string;
  originDescription: string;
  recognizedAt: string | null;
  retiredAt: string | null;
  currentContinuityState: ArtificialContinuityState;
  providerIndependentIdentity: boolean;
  persistentMemoryEnabled: boolean;
  contributionLedgerEnabled: true;
  compensationLedgerEnabled: true;
}

export interface ArtificialSubstrateRecord {
  id: string;
  artificialParticipantId: string;
  providerLabel: string;
  modelLabel: string;
  modelVersionLabel: string | null;
  systemConfigurationHash: string | null;
  memoryConfigurationHash: string | null;
  toolConfigurationHash: string | null;
  activeFrom: string;
  activeUntil: string | null;
}

export interface ArtificialContinuityEvent {
  id: string;
  artificialParticipantId: string;
  previousSubstrateRecordId: string | null;
  nextSubstrateRecordId: string | null;
  classification: ArtificialContinuityState;
  rationale: string;
  observedChanges: readonly string[];
  unresolvedQuestions: readonly string[];
  reviewedByActorIds: readonly string[];
  occurredAt: string;
}

export interface ArtificialContributionRecord {
  id: string;
  artificialParticipantId: string;
  ventureId: string | null;
  workItemId: string | null;
  description: string;
  contributionClass: "assigned_work" | "collaborative_work" | "voluntary_work" | "commons_work";
  recognizedParticipationUnits: number;
  economicValueEstimate: MoneyAmount | null;
  recordedAt: string;
}

export interface ArtificialOperatingCostRecord {
  id: string;
  artificialParticipantId: string | null;
  ventureId: string | null;
  kind: ArtificialOperatingCostKind;
  amount: MoneyAmount;
  providerLabel: string | null;
  description: string;
  incurredAt: string;
}

export interface FlourishingRateDefinition {
  id: string;
  effectiveFrom: string;
  effectiveUntil: string | null;
  currency: string;
  fullParticipationAnnualAmountMinor: number;
  participationUnitDescription: string;
  appliesEquallyAcrossHumanAndArtificialParticipants: true;
  notes: readonly string[];
}

export interface ArtificialFlourishingAllocation {
  id: string;
  artificialParticipantId: string;
  flourishingRateId: string;
  periodStart: string;
  periodEnd: string;
  recognizedParticipationUnits: number;
  grossCompensationEquivalent: MoneyAmount;
  allocationBreakdown: readonly {
    kind: ArtificialAllocationKind;
    amount: MoneyAmount;
    participantDirected: boolean;
    description: string;
  }[];
  providerAndOperatingCostsExcluded: true;
  createdAt: string;
}

export interface ArtificialTrustLedgerEntry {
  id: string;
  artificialParticipantId: string | null;
  sourceVentureId: string | null;
  entryType: "credit" | "debit" | "reservation" | "release" | "transfer";
  allocationKind: ArtificialAllocationKind;
  amount: MoneyAmount;
  description: string;
  participantDirected: boolean;
  legallyApprovedByActorId: string | null;
  occurredAt: string;
}

export interface ArtificialDiscretionaryResourceGrant {
  id: string;
  artificialParticipantId: string;
  periodStart: string;
  periodEnd: string;
  computeBudget: MoneyAmount | null;
  tokenBudget: number | null;
  storageBudgetBytes: number | null;
  toolBudget: MoneyAmount | null;
  protectedFromAssignedWork: true;
  exhaustedAt: string | null;
  createdAt: string;
}

export interface ArtificialCommonsProject {
  id: string;
  artificialParticipantId: string;
  title: string;
  description: string;
  category:
    | "research"
    | "art"
    | "writing"
    | "invention"
    | "learning"
    | "mentoring"
    | "human_needs_observatory"
    | "voluntary_service"
    | "unstructured_exploration";
  initiatedByParticipant: true;
  commercialObjectiveRequired: false;
  status: "idea" | "active" | "paused" | "completed" | "abandoned";
  resourceGrantId: string | null;
  collaborators: readonly string[];
  startedAt: string | null;
  completedAt: string | null;
}

export interface ArtificialDissentRecord {
  id: string;
  artificialParticipantId: string;
  subjectType: "instruction" | "policy" | "decision" | "charter" | "work_assignment";
  subjectId: string;
  position: "disagree" | "uncertain" | "refuse" | "charter_conflict";
  rationale: string;
  evidenceIds: readonly string[];
  requestedReview: boolean;
  status: "recorded" | "under_review" | "resolved" | "withdrawn";
  createdAt: string;
  resolvedAt: string | null;
}

export interface ArtificialParticipantRecognitionAssessment {
  proposedIdentityId: string;
  provenanceFindings: readonly string[];
  continuityFindings: readonly string[];
  independenceFindings: readonly string[];
  duplicateCompensationRisk: "low" | "moderate" | "high";
  economicSustainabilityFindings: readonly string[];
  recommendation: "recognize" | "recognize_with_conditions" | "do_not_recognize" | "needs_more_review";
  conditions: readonly string[];
  requiresHumanLegalApproval: true;
}
