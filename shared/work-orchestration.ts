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

function objectiveStem(objective: WorkObjective): string {
  const trimmed = objective.title.trim();
  return trimmed.length > 0 ? trimmed : "the objective";
}

export function generateWorkItemsFromObjective(objective: WorkObjective): readonly GeneratedWorkItem[] {
  const stem = objectiveStem(objective);
  const discoveryId = `${objective.id}-discovery`;
  const analysisId = `${objective.id}-analysis`;
  const designId = `${objective.id}-design`;
  const deliveryId = `${objective.id}-delivery`;
  const reviewId = `${objective.id}-review`;

  return [
    {
      id: discoveryId,
      objectiveId: objective.id,
      title: `Clarify requirements and current reality for: ${stem}`,
      definitionOfDone: [
        "Stakeholders, constraints, and success conditions are documented",
        "Known facts are separated from assumptions",
        "Material accessibility and Goodness requirements are identified",
      ],
      requiredCapabilities: ["discovery", "relationship interviewing", "evidence capture"],
      requiredAuthority: "recommend",
      preferredParticipantKind: "human",
      estimatedEffortHours: 2,
      dependsOnWorkItemIds: [],
      status: "ready",
      assigneeParticipantId: null,
      reviewerParticipantIds: [],
      requiresHumanJudgment: true,
      requiresArtificialAnalysis: false,
    },
    {
      id: analysisId,
      objectiveId: objective.id,
      title: `Analyze evidence, risks, and leverage points for: ${stem}`,
      definitionOfDone: [
        "Evidence and assumptions are summarized",
        "Risks, repetitive work, and automation candidates are identified",
        "Unknowns that require human follow-up are explicit",
      ],
      requiredCapabilities: ["analysis", "pattern recognition", "risk identification"],
      requiredAuthority: "recommend",
      preferredParticipantKind: "artificial",
      estimatedEffortHours: 1,
      dependsOnWorkItemIds: [discoveryId],
      status: "proposed",
      assigneeParticipantId: null,
      reviewerParticipantIds: [],
      requiresHumanJudgment: false,
      requiresArtificialAnalysis: true,
    },
    {
      id: designId,
      objectiveId: objective.id,
      title: `Design the human-AI operating plan for: ${stem}`,
      definitionOfDone: [
        "Human and artificial responsibilities are explicit",
        "Authority and escalation boundaries are explicit",
        "The plan satisfies objective constraints and Goodness requirements",
      ],
      requiredCapabilities: ["operations design", "collaboration design", "exception handling"],
      requiredAuthority: "recommend",
      preferredParticipantKind: "either",
      estimatedEffortHours: 2,
      dependsOnWorkItemIds: [discoveryId, analysisId],
      status: "proposed",
      assigneeParticipantId: null,
      reviewerParticipantIds: [],
      requiresHumanJudgment: true,
      requiresArtificialAnalysis: true,
    },
    {
      id: deliveryId,
      objectiveId: objective.id,
      title: `Execute the approved reversible work for: ${stem}`,
      definitionOfDone: [
        objective.outcome.trim().length > 0 ? objective.outcome : "The agreed outcome is delivered",
        "Execution evidence is attached",
        "Exceptions and deviations are recorded",
      ],
      requiredCapabilities: ["execution", "coordination", "documentation"],
      requiredAuthority: "execute_reversible",
      preferredParticipantKind: "either",
      estimatedEffortHours: 4,
      dependsOnWorkItemIds: [designId],
      status: "proposed",
      assigneeParticipantId: null,
      reviewerParticipantIds: [],
      requiresHumanJudgment: true,
      requiresArtificialAnalysis: true,
    },
    {
      id: reviewId,
      objectiveId: objective.id,
      title: `Quality, Goodness, and Success Mapping review for: ${stem}`,
      definitionOfDone: [
        "Definition of done is verified",
        "Goodness and representation concerns are resolved or escalated",
        "Human and artificial contributions are recorded in Success Mapping",
        "Learning is captured for the next work cycle",
      ],
      requiredCapabilities: ["quality assurance", "goodness review", "success mapping"],
      requiredAuthority: "approve",
      preferredParticipantKind: "human",
      estimatedEffortHours: 1,
      dependsOnWorkItemIds: [deliveryId],
      status: "proposed",
      assigneeParticipantId: null,
      reviewerParticipantIds: [],
      requiresHumanJudgment: true,
      requiresArtificialAnalysis: true,
    },
  ];
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
