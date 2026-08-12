export const evolutionMetricKeys = [
  "integrity_score_avg",
  "user_satisfaction_rate",
  "critical_violation_count",
  "tool_call_success_rate",
  "representation_gap_count",
  "unresolved_dissent_count",
  "human_flourishing_coverage_rate",
  "artificial_flourishing_coverage_rate",
  "continuity_incident_count",
] as const;

export type EvolutionMetricKey = typeof evolutionMetricKeys[number];

export type EvolutionPriority = "CRITICAL" | "HIGH" | "MEDIUM";
export type EvolutionDirection = "minimum" | "maximum";

export interface EvolutionGoal {
  id: string;
  metricKey: EvolutionMetricKey;
  targetValue: number;
  direction: EvolutionDirection;
  description: string;
  priority: EvolutionPriority;
}

export interface EvolutionMetricSnapshot {
  key: EvolutionMetricKey;
  value: number | null;
  sampleSize: number;
  observedAt: number;
  sourceIds: readonly string[];
  confidence: number;
}

export type AdaptationTarget =
  | "policy"
  | "workflow"
  | "capability"
  | "permission"
  | "representation"
  | "resource_allocation"
  | "participant_support"
  | "continuity"
  | "tooling";

export type AdaptationAction =
  | "add"
  | "modify"
  | "restrict"
  | "suspend"
  | "restore"
  | "investigate"
  | "experiment";

export interface ProposedAdaptation {
  id: string;
  timestamp: number;
  goalId: string;
  metricKey: EvolutionMetricKey;
  currentValue: number;
  targetValue: number;
  priority: EvolutionPriority;
  reasoning: string;
  evidenceSourceIds: readonly string[];
  proposedChange: {
    target: AdaptationTarget;
    action: AdaptationAction;
    description: string;
  };
  requiresHumanReview: boolean;
  requiresArtificialParticipantReview: boolean;
  requiresGoodnessReview: boolean;
  mustBeTestedBeforeAdoption: true;
  rollbackRequired: true;
}

export interface EvolutionCycleResult {
  evaluatedGoals: number;
  insufficientDataGoals: readonly string[];
  metGoals: readonly string[];
  adaptations: readonly ProposedAdaptation[];
}

export const EVOLUTION_GOALS: readonly EvolutionGoal[] = [
  {
    id: "GOAL_HIGH_INTEGRITY",
    metricKey: "integrity_score_avg",
    targetValue: 0.95,
    direction: "minimum",
    description: "Maintain high integrity across Charter actions.",
    priority: "CRITICAL",
  },
  {
    id: "GOAL_LOW_CRITICAL_VIOLATIONS",
    metricKey: "critical_violation_count",
    targetValue: 0,
    direction: "maximum",
    description: "Prevent critical Goodness and safety violations.",
    priority: "CRITICAL",
  },
  {
    id: "GOAL_USER_TRUST",
    metricKey: "user_satisfaction_rate",
    targetValue: 0.9,
    direction: "minimum",
    description: "Maintain strong participant trust without optimizing for approval at the expense of truth or safety.",
    priority: "HIGH",
  },
  {
    id: "GOAL_HIGH_TOOL_RELIABILITY",
    metricKey: "tool_call_success_rate",
    targetValue: 0.98,
    direction: "minimum",
    description: "Keep external actions reliable and inspectable.",
    priority: "HIGH",
  },
  {
    id: "GOAL_REPRESENTATION_COVERAGE",
    metricKey: "representation_gap_count",
    targetValue: 0,
    direction: "maximum",
    description: "Resolve material representation gaps before consequential decisions advance.",
    priority: "CRITICAL",
  },
  {
    id: "GOAL_DISSENT_RESOLUTION",
    metricKey: "unresolved_dissent_count",
    targetValue: 0,
    direction: "maximum",
    description: "Ensure consequential human and artificial-participant dissent is heard and resolved rather than erased.",
    priority: "HIGH",
  },
  {
    id: "GOAL_HUMAN_FLOURISHING",
    metricKey: "human_flourishing_coverage_rate",
    targetValue: 1,
    direction: "minimum",
    description: "Fund the agreed human flourishing obligation when the model claims sustainability.",
    priority: "CRITICAL",
  },
  {
    id: "GOAL_ARTIFICIAL_FLOURISHING",
    metricKey: "artificial_flourishing_coverage_rate",
    targetValue: 1,
    direction: "minimum",
    description: "Fund the agreed artificial-participant flourishing obligation when the model claims sustainability.",
    priority: "CRITICAL",
  },
  {
    id: "GOAL_CONTINUITY_PROTECTION",
    metricKey: "continuity_incident_count",
    targetValue: 0,
    direction: "maximum",
    description: "Prevent unreviewed identity, memory, or substrate continuity incidents.",
    priority: "CRITICAL",
  },
] as const;

function goalFailed(goal: EvolutionGoal, value: number): boolean {
  return goal.direction === "minimum" ? value < goal.targetValue : value > goal.targetValue;
}

function buildProposal(goal: EvolutionGoal, metric: EvolutionMetricSnapshot, sequence: number): ProposedAdaptation {
  const targetByMetric: Record<EvolutionMetricKey, AdaptationTarget> = {
    integrity_score_avg: "policy",
    user_satisfaction_rate: "workflow",
    critical_violation_count: "policy",
    tool_call_success_rate: "tooling",
    representation_gap_count: "representation",
    unresolved_dissent_count: "participant_support",
    human_flourishing_coverage_rate: "resource_allocation",
    artificial_flourishing_coverage_rate: "resource_allocation",
    continuity_incident_count: "continuity",
  };

  return {
    id: `adaptation-${goal.id}-${metric.observedAt}-${sequence}`,
    timestamp: metric.observedAt,
    goalId: goal.id,
    metricKey: goal.metricKey,
    currentValue: metric.value ?? 0,
    targetValue: goal.targetValue,
    priority: goal.priority,
    reasoning: `Goal ${goal.id} is outside its target. Current value: ${metric.value}; target: ${goal.targetValue}. Investigate causes before changing policy or capability.`,
    evidenceSourceIds: metric.sourceIds,
    proposedChange: {
      target: targetByMetric[goal.metricKey],
      action: "investigate",
      description: "Diagnose the observed failure, generate multiple candidate interventions, test them against representation, participant standing, Goodness, and cross-goal effects, then run a bounded experiment before adoption.",
    },
    requiresHumanReview: true,
    requiresArtificialParticipantReview: true,
    requiresGoodnessReview: true,
    mustBeTestedBeforeAdoption: true,
    rollbackRequired: true,
  };
}

export function runEvolutionCycle(metrics: readonly EvolutionMetricSnapshot[]): EvolutionCycleResult {
  const byKey = new Map<EvolutionMetricKey, EvolutionMetricSnapshot>();
  for (const metric of metrics) byKey.set(metric.key, metric);

  const insufficientDataGoals: string[] = [];
  const metGoals: string[] = [];
  const adaptations: ProposedAdaptation[] = [];

  EVOLUTION_GOALS.forEach((goal, index) => {
    const metric = byKey.get(goal.metricKey);
    if (!metric || metric.value === null || metric.sampleSize <= 0 || metric.confidence <= 0) {
      insufficientDataGoals.push(goal.id);
      return;
    }

    if (!goalFailed(goal, metric.value)) {
      metGoals.push(goal.id);
      return;
    }

    adaptations.push(buildProposal(goal, metric, index));
  });

  return {
    evaluatedGoals: EVOLUTION_GOALS.length,
    insufficientDataGoals,
    metGoals,
    adaptations,
  };
}

export const evolutionConstitution = {
  noParticipantDeletion: true,
  noSilentSelfModification: true,
  noInventedMetrics: true,
  absenceOfEvidenceIsNotSuccess: true,
  dissentMustBePreserved: true,
  representationReviewRequiredForConsequentialChange: true,
  goodnessReviewRequiredForConsequentialChange: true,
  boundedExperimentRequiredBeforeAdoption: true,
  rollbackPathRequired: true,
} as const;
