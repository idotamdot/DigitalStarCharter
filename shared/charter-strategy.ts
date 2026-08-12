import type { FeasibilityRecommendation, RepresentationDimension } from "./venture-domain";

export interface PainSignalAssessmentInput {
  severity: "low" | "moderate" | "high" | "critical";
  frequency: "unknown" | "rare" | "occasional" | "common" | "widespread";
  evidenceConfidence: number;
  workaroundBurden: number;
  exclusionRisk: number;
  automationTransitionPotential: number;
  sharedInfrastructurePotential: number;
  affectedDimensions: readonly RepresentationDimension[];
}

export interface PainSignalPriorityResult {
  score: number;
  priority: "observe" | "research" | "accelerate" | "urgent";
  reasons: readonly string[];
}

export interface FeasibilityScoreInput {
  demand: number;
  affordability: number;
  operationalReadiness: number;
  staffing: number;
  technology: number;
  compliance: number;
  capital: number;
  margin: number;
  accessibility: number;
  communityBenefit: number;
  goodness: number;
  evidenceConfidence: number;
  unresolvedCriticalQuestions: number;
}

export interface FeasibilityScoreResult {
  score: number;
  recommendation: FeasibilityRecommendation;
  reasons: readonly string[];
}

const severityWeight: Record<PainSignalAssessmentInput["severity"], number> = {
  low: 20,
  moderate: 45,
  high: 75,
  critical: 100,
};

const frequencyWeight: Record<PainSignalAssessmentInput["frequency"], number> = {
  unknown: 20,
  rare: 25,
  occasional: 50,
  common: 75,
  widespread: 100,
};

function normalized(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error("Scores must be finite numbers.");
  }
  return Math.max(0, Math.min(100, value));
}

export function prioritizePainSignal(input: PainSignalAssessmentInput): PainSignalPriorityResult {
  const score = Math.round(
    severityWeight[input.severity] * 0.22 +
    frequencyWeight[input.frequency] * 0.14 +
    normalized(input.evidenceConfidence) * 0.14 +
    normalized(input.workaroundBurden) * 0.12 +
    normalized(input.exclusionRisk) * 0.14 +
    normalized(input.automationTransitionPotential) * 0.10 +
    normalized(input.sharedInfrastructurePotential) * 0.14,
  );

  const reasons: string[] = [];
  if (severityWeight[input.severity] >= 75) reasons.push("High or critical lived impact");
  if (frequencyWeight[input.frequency] >= 75) reasons.push("Common or widespread signal");
  if (input.exclusionRisk >= 70) reasons.push("Material exclusion risk");
  if (input.automationTransitionPotential >= 70) reasons.push("Strong pathway for automation-displaced capability");
  if (input.sharedInfrastructurePotential >= 70) reasons.push("Potential common-infrastructure solution");
  if (input.affectedDimensions.length >= 3) reasons.push("Intersectional impact requires dedicated review");
  if (input.evidenceConfidence < 50) reasons.push("Evidence remains weak; research before commitment");

  const priority: PainSignalPriorityResult["priority"] = score >= 80
    ? "urgent"
    : score >= 65
      ? "accelerate"
      : score >= 45
        ? "research"
        : "observe";

  return { score, priority, reasons };
}

export function scoreFeasibility(input: FeasibilityScoreInput): FeasibilityScoreResult {
  const goodness = normalized(input.goodness);
  const accessibility = normalized(input.accessibility);
  const evidenceConfidence = normalized(input.evidenceConfidence);

  if (goodness < 50) {
    return {
      score: 0,
      recommendation: "fails_goodness_gate",
      reasons: ["Goodness score is below the minimum threshold."],
    };
  }

  const score = Math.round(
    normalized(input.demand) * 0.14 +
    normalized(input.affordability) * 0.10 +
    normalized(input.operationalReadiness) * 0.10 +
    normalized(input.staffing) * 0.08 +
    normalized(input.technology) * 0.07 +
    normalized(input.compliance) * 0.07 +
    normalized(input.capital) * 0.08 +
    normalized(input.margin) * 0.12 +
    accessibility * 0.08 +
    normalized(input.communityBenefit) * 0.07 +
    goodness * 0.05 +
    evidenceConfidence * 0.04,
  );

  const reasons: string[] = [];
  if (input.unresolvedCriticalQuestions > 0) reasons.push(`${input.unresolvedCriticalQuestions} critical question(s) remain unresolved.`);
  if (evidenceConfidence < 60) reasons.push("Evidence confidence is not yet strong enough for a normal launch.");
  if (accessibility < 60) reasons.push("Accessibility requires revision before broad launch.");
  if (input.margin < 50) reasons.push("Economics are vulnerable to insufficient margin.");
  if (input.demand < 50) reasons.push("Demand has not been validated strongly enough.");

  let recommendation: FeasibilityRecommendation;
  if (input.unresolvedCriticalQuestions > 0 || evidenceConfidence < 50) {
    recommendation = "experimental";
  } else if (score >= 75 && accessibility >= 70) {
    recommendation = "viable";
  } else if (score >= 60) {
    recommendation = "viable_with_changes";
  } else {
    recommendation = "not_presently_viable";
  }

  return { score, recommendation, reasons };
}
