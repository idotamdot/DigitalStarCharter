import type { ManagementEvidenceItem } from "@shared/ai-management-schema";
import type { DeterministicFinding } from "./management-rules";
import type { ManagementContext } from "./management-snapshot";

function countMetric(name: string, value: number) {
  return { name, value, unit: "count" as const };
}

export function generateGoodnessFindings(context: ManagementContext): DeterministicFinding[] {
  if (context.goodnessBlocks.length === 0) return [];

  const evidence: ManagementEvidenceItem[] = context.goodnessBlocks.map((item) => ({
    source: "goodness",
    fact: "A proposed or blocked work order has unresolved Goodness criteria and therefore may not enter production.",
    recordIds: [item.workOrderId, ...item.criterionIds],
    metrics: [countMetric("unresolved_goodness_criteria", item.blockingCount)],
  }));

  return [{
    domain: "goodness",
    findingType: "goodness_gate_blockers",
    severity: context.snapshot.openGoodnessBlockCount >= 10 ? "high" : "medium",
    title: "Proposed work has unresolved Goodness Gate criteria",
    summary: `${context.goodnessBlocks.length} proposed work order(s) currently have ${context.snapshot.openGoodnessBlockCount} unresolved Goodness criterion review(s).`,
    recommendation: "Goodness Steward should review the proposal evidence. Revise any work that does not pass every active criterion; do not move it into production while any Goodness blocker remains.",
    rationale: "DigitalStarCharter treats Goodness as a production prerequisite, not a preference. The core criteria are non-waivable, so schedule, revenue pressure or AI confidence cannot substitute for a human Goodness pass.",
    confidence: 1,
    consequenceLevel: "high",
    evidence,
    riskFlags: ["goodness-gate", "production-block", "non-waivable"],
  }];
}
