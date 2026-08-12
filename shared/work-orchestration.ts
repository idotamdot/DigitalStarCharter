export const onboardingStages = [
  "identity",
  "capabilities",
  "needs",
  "aspirations",
  "work_preferences",
  "accessibility",
  "thought_partner",
  "role_design",
  "ready",
] as const;

export type OnboardingStage = typeof onboardingStages[number];

export const workItemStatuses = [
  "proposed",
  "ready",
  "assigned",
  "in_progress",
  "blocked",
  "review",
  "completed",
  "cancelled",
] as const;

export type WorkItemStatus = typeof workItemStatuses[number];

export const participantKinds = ["human", "artificial"] as const;
export type WorkParticipantKind = typeof participantKinds[number];

export type WorkAuthority =
  | "inform"
  | "recommend"
  | "execute_reversible"
  | "approve"
  | "execute_consequential";

export interface ParticipantCapability {
  id: string;
  name: string;
  confidence: number;
  evidence: readonly string[];
  wantsToUse: boolean;
  wantsToDevelop: boolean;
}

export interface WorkPreferences {
  preferredHoursPerWeek: number | null;
  scheduleNotes: string | null;
  collaborationPreferences: readonly string[];
  tasksToAvoid: readonly string[];
  accessibilityNeeds: readonly string[];
}

export interface ParticipantOnboardingProfile {
  participantId: string;
  participantKind: WorkParticipantKind;
  displayName: string;
  stage: OnboardingStage;
  capabilities: readonly ParticipantCapability[];
  needs: readonly string[];
  aspirations: readonly string[];
  preferences: WorkPreferences;
  thoughtPartnerParticipantId: string | null;
  proposedRoleTitle: string | null;
  proposedRolePurpose: string | null;
  approvedAuthorities: readonly WorkAuthority[];
}

export interface WorkObjective {
  id: string;
  title: string;
  outcome: string;
  source: "customer_commitment" | "venture_goal" | "maintenance" | "goodness" | "participant_proposal" | "commons";
  priority: "critical" | "high" | "normal" | "low";
  dueAt: string | null;
  constraints: readonly string[];
  goodnessRequirements: readonly string[];
}

export interface GeneratedWorkItem {
  id: string;
  objectiveId: string;
  title: string;
  definitionOfDone: readonly string[];
  requiredCapabilities: readonly string[];
  requiredAuthority: WorkAuthority;
  preferredParticipantKind: WorkParticipantKind | "either";
  estimatedEffortHours: number | null;
  dependsOnWorkItemIds: readonly string[];
  status: WorkItemStatus;
  assigneeParticipantId: string | null;
  reviewerParticipantIds: readonly string[];
  requiresHumanJudgment: boolean;
  requiresArtificialAnalysis: boolean;
}

export interface TaskRoutingCandidate {
  participantId: string;
  capabilityFit: number;
  preferenceFit: number;
  authorityFit: boolean;
  availabilityFit: number;
  reasons: readonly string[];
}

export interface TaskRoutingResult {
  workItemId: string;
  recommendedParticipantId: string | null;
  score: number;
  reasons: readonly string[];
  requiresReview: boolean;
}

export interface SuccessMapEntry {
  participantId: string;
  workItemId: string;
  contribution: string;
  evidence: readonly string[];
  capabilitiesDemonstrated: readonly string[];
  capabilitiesDeveloped: readonly string[];
  collaboratorAcknowledgements: readonly string[];
  participantReflection: string | null;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function routeWorkItem(
  workItem: GeneratedWorkItem,
  candidates: readonly TaskRoutingCandidate[],
): TaskRoutingResult {
  const eligible = candidates.filter((candidate) => candidate.authorityFit);

  if (eligible.length === 0) {
    return {
      workItemId: workItem.id,
      recommendedParticipantId: null,
      score: 0,
      reasons: ["No participant currently has the required authority."],
      requiresReview: true,
    };
  }

  const ranked = [...eligible]
    .map((candidate) => ({
      ...candidate,
      routingScore: clampPercent(
        candidate.capabilityFit * 0.55 +
        candidate.preferenceFit * 0.25 +
        candidate.availabilityFit * 0.20,
      ),
    }))
    .sort((left, right) => right.routingScore - left.routingScore);

  const best = ranked[0];
  return {
    workItemId: workItem.id,
    recommendedParticipantId: best.participantId,
    score: best.routingScore,
    reasons: best.reasons,
    requiresReview: best.routingScore < 70 || workItem.requiresHumanJudgment,
  };
}

export function onboardingCompletion(profile: ParticipantOnboardingProfile): number {
  const stageIndex = onboardingStages.indexOf(profile.stage);
  if (stageIndex < 0) return 0;
  return Math.round((stageIndex / (onboardingStages.length - 1)) * 100);
}
