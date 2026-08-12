import type {
  RepresentationDimension,
  RepresentationPerspective,
} from "./venture-domain";
import type {
  InnovationOpportunitySignal,
  PainPointSignal,
} from "./universal-representation";

export const observatoryPrinciples = [
  "Begin with experienced human pain rather than a predetermined product.",
  "Treat lived experience as evidence about the problem, not as proof of a particular solution.",
  "Search for structural causes and repeated workarounds before proposing technology.",
  "Use AI for breadth, synthesis, scenario generation, research, and iteration while retaining meaningful human challenge and judgment.",
  "Prefer opportunities that increase human agency, livelihood, access, dignity, or shared flourishing.",
  "Do not interpret underserved populations merely as markets to extract from; identify who benefits, who pays, who owns, and who bears risk.",
  "A promising pain point does not become a venture until demand, affordability, delivery, staffing, compliance, economics, and goodness are investigated.",
  "People affected by automation should be considered first for human roles created around the new value chain when their capabilities and preferences fit.",
] as const;

export const opportunityStages = [
  "signal",
  "triage",
  "research",
  "co_design",
  "feasibility",
  "charter_candidate",
  "declined",
] as const;

export type OpportunityStage = typeof opportunityStages[number];

export interface LivedExperienceContribution {
  id: string;
  contributorActorId: string;
  perspectiveIds: readonly string[];
  dimensions: readonly RepresentationDimension[];
  painPointSignalId: string | null;
  opportunitySignalId: string | null;
  contributionType:
    | "experience"
    | "challenge"
    | "workaround"
    | "solution_idea"
    | "prototype_feedback"
    | "risk_warning"
    | "validation";
  statement: string;
  consentToUseForDesign: boolean;
  mayContactForFollowUp: boolean;
  createdAt: string;
}

export interface OpportunityResearchQuestion {
  id: string;
  opportunitySignalId: string;
  category:
    | "demand"
    | "frequency"
    | "severity"
    | "existing_alternatives"
    | "affordability"
    | "payer"
    | "delivery"
    | "accessibility"
    | "staffing"
    | "automation"
    | "compliance"
    | "economics"
    | "ownership"
    | "environment"
    | "community"
    | "other";
  question: string;
  requiredBeforeFeasibility: boolean;
  answered: boolean;
  evidenceIds: readonly string[];
  answer: string | null;
}

export interface HumanAiCollaborationHypothesis {
  id: string;
  opportunitySignalId: string;
  humanResponsibilities: readonly string[];
  aiResponsibilities: readonly string[];
  sharedResponsibilities: readonly string[];
  humanDecisionAuthorities: readonly string[];
  prohibitedAiAuthorities: readonly string[];
  displacedWorkerPathways: readonly string[];
  unresolvedRoleQuestions: readonly string[];
}

export interface OpportunityPriorityFactors {
  severity: number;
  reach: number;
  evidenceStrength: number;
  neglect: number;
  humanAgencyGain: number;
  livelihoodPotential: number;
  sharedInfrastructurePotential: number;
  accessibilityGain: number;
  feasibilitySignal: number;
  extractionRisk: number;
  harmRisk: number;
}

export interface OpportunityPriorityAssessment {
  opportunitySignalId: string;
  factors: OpportunityPriorityFactors;
  score: number;
  rationale: readonly string[];
  stage: OpportunityStage;
  requiresHumanReview: true;
}

export interface RepresentationGap {
  dimension: RepresentationDimension;
  reasonMaterial: string;
  missingPerspectiveDescription: string;
  blocksAdvancement: boolean;
}

export interface ObservatoryReview {
  opportunitySignalId: string;
  relevantPerspectiveIds: readonly string[];
  generatedIntersectionDescriptions: readonly string[];
  representationGaps: readonly RepresentationGap[];
  livedExperienceContributionIds: readonly string[];
  researchQuestionIds: readonly string[];
  collaborationHypothesisId: string | null;
  priorityAssessment: OpportunityPriorityAssessment;
  mayAdvance: boolean;
  blockingReasons: readonly string[];
  reviewedAt: string;
}

export interface OpportunityCandidateInput {
  opportunity: InnovationOpportunitySignal;
  painPoints: readonly PainPointSignal[];
  perspectives: readonly RepresentationPerspective[];
  evidenceStrength: number;
  neglect: number;
  humanAgencyGain: number;
  livelihoodPotential: number;
  sharedInfrastructurePotential: number;
  accessibilityGain: number;
  feasibilitySignal: number;
  extractionRisk: number;
  harmRisk: number;
}

const severityWeights: Readonly<Record<PainPointSignal["severity"], number>> = {
  low: 20,
  moderate: 45,
  high: 75,
  critical: 100,
};

const frequencyWeights: Readonly<Record<PainPointSignal["frequencyEstimate"], number>> = {
  unknown: 20,
  rare: 20,
  occasional: 45,
  common: 75,
  widespread: 100,
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function assessOpportunityPriority(
  input: OpportunityCandidateInput,
): OpportunityPriorityAssessment {
  const linkedPainPoints = input.painPoints.filter((painPoint) =>
    input.opportunity.painPointSignalIds.includes(painPoint.id),
  );

  const severity = average(
    linkedPainPoints.map((painPoint) => severityWeights[painPoint.severity]),
  );
  const reach = average(
    linkedPainPoints.map((painPoint) => frequencyWeights[painPoint.frequencyEstimate]),
  );

  const factors: OpportunityPriorityFactors = {
    severity: clampScore(severity),
    reach: clampScore(reach),
    evidenceStrength: clampScore(input.evidenceStrength),
    neglect: clampScore(input.neglect),
    humanAgencyGain: clampScore(input.humanAgencyGain),
    livelihoodPotential: clampScore(input.livelihoodPotential),
    sharedInfrastructurePotential: clampScore(input.sharedInfrastructurePotential),
    accessibilityGain: clampScore(input.accessibilityGain),
    feasibilitySignal: clampScore(input.feasibilitySignal),
    extractionRisk: clampScore(input.extractionRisk),
    harmRisk: clampScore(input.harmRisk),
  };

  const benefitScore =
    factors.severity * 0.13 +
    factors.reach * 0.08 +
    factors.evidenceStrength * 0.12 +
    factors.neglect * 0.11 +
    factors.humanAgencyGain * 0.12 +
    factors.livelihoodPotential * 0.13 +
    factors.sharedInfrastructurePotential * 0.1 +
    factors.accessibilityGain * 0.08 +
    factors.feasibilitySignal * 0.13;

  const riskPenalty = factors.extractionRisk * 0.12 + factors.harmRisk * 0.18;
  const score = clampScore(benefitScore - riskPenalty);

  const rationale: string[] = [];
  if (factors.severity >= 75) rationale.push("The underlying pain is severe.");
  if (factors.neglect >= 70) rationale.push("The need appears materially underserved or poorly addressed.");
  if (factors.livelihoodPotential >= 70) rationale.push("The opportunity may create meaningful human livelihood.");
  if (factors.sharedInfrastructurePotential >= 70) rationale.push("The solution may support multiple proprietors through shared infrastructure.");
  if (factors.accessibilityGain >= 70) rationale.push("The opportunity could materially improve access for constrained users.");
  if (factors.evidenceStrength < 50) rationale.push("Evidence is not yet strong enough for confident feasibility conclusions.");
  if (factors.extractionRisk >= 60) rationale.push("The proposed model presents material extraction risk and requires redesign or controls.");
  if (factors.harmRisk >= 60) rationale.push("Potential harms require resolution before advancement.");

  const stage: OpportunityStage =
    factors.harmRisk >= 85 || factors.extractionRisk >= 85
      ? "triage"
      : factors.evidenceStrength < 50
        ? "research"
        : input.opportunity.requiresLivedExperienceCoDesign
          ? "co_design"
          : "feasibility";

  return {
    opportunitySignalId: input.opportunity.id,
    factors,
    score,
    rationale,
    stage,
    requiresHumanReview: true,
  };
}

export function hasBlockingRepresentationGaps(
  gaps: readonly RepresentationGap[],
): boolean {
  return gaps.some((gap) => gap.blocksAdvancement);
}
