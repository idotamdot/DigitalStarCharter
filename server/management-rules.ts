import type {
  ManagementEvidenceItem,
  ManagementFindingSeverity,
} from "@shared/ai-management-schema";
import type { ConsequenceLevel, OperatingDomain } from "@shared/operating-schema";
import type { ManagementContext } from "./management-snapshot";

export interface DeterministicFinding {
  domain: OperatingDomain;
  findingType: string;
  severity: ManagementFindingSeverity;
  title: string;
  summary: string;
  recommendation: string;
  rationale: string;
  confidence: number;
  consequenceLevel: ConsequenceLevel;
  evidence: ManagementEvidenceItem[];
  riskFlags: string[];
}

function metric(
  name: string,
  value: number,
  unit: "count" | "cents" | "percent" | "months" | "hours" | "days",
) {
  return { name, value, unit } as const;
}

export function generateDeterministicFindings(context: ManagementContext): DeterministicFinding[] {
  const findings: DeterministicFinding[] = [];
  const { snapshot } = context;

  if (context.unassignedMemberIds.length > 0) {
    findings.push({
      domain: "people",
      findingType: "unassigned_members",
      severity: context.unassignedMemberIds.length > 2 ? "high" : "medium",
      title: "Active members lack an operating role",
      summary: `${context.unassignedMemberIds.length} active member(s) currently have no active role assignment.`,
      recommendation: "Review each member's stated skills, preferences, constraints and current organizational needs before proposing a role assignment or learning path.",
      rationale: "People should not become organizationally invisible, but role assignment is consequential and should be based on explicit member information rather than automatic placement.",
      confidence: 0.99,
      consequenceLevel: "medium",
      evidence: [{
        source: "roles",
        fact: "Active members exist without active role assignments.",
        recordIds: context.unassignedMemberIds,
        metrics: [metric("unassigned_members", context.unassignedMemberIds.length, "count")],
      }],
      riskFlags: ["role-coverage", "member-visibility"],
    });
  }

  if (context.incompleteProfileMemberIds.length > 0) {
    findings.push({
      domain: "people",
      findingType: "profile_information_gap",
      severity: "low",
      title: "Role-fit information is incomplete",
      summary: `${context.incompleteProfileMemberIds.length} active member profile(s) do not yet contain enough self-stated planning information for strong role-fit analysis.`,
      recommendation: "Invite those members to complete skills, preferred work, constraints, availability and learning goals before the system makes role-fit recommendations.",
      rationale: "The platform should ask people what they can and want to do instead of inferring sensitive attributes or assigning work from weak evidence.",
      confidence: 0.98,
      consequenceLevel: "low",
      evidence: [{
        source: "member_profiles",
        fact: "Profiles lack self-stated planning data used for role-fit analysis.",
        recordIds: context.incompleteProfileMemberIds,
        metrics: [metric("incomplete_profiles", context.incompleteProfileMemberIds.length, "count")],
      }],
      riskFlags: ["insufficient-member-data"],
    });
  }

  const overloaded = context.workloadByMember.filter((item) => item.activeWorkCount >= 5);
  if (overloaded.length > 0) {
    const maxLoad = Math.max(...overloaded.map((item) => item.activeWorkCount));
    findings.push({
      domain: "people",
      findingType: "workload_concentration",
      severity: maxLoad >= 8 ? "high" : "medium",
      title: "Active work is concentrated on a small number of members",
      summary: `${overloaded.length} member(s) currently hold at least five active work orders; the highest observed load is ${maxLoad}.`,
      recommendation: "Review workload with the affected members and redistribute, defer or split work where appropriate. Do not reassign work without the required human authority.",
      rationale: "Persistent concentration can create dropped commitments, burnout risk and single-person operational dependencies even when total network capacity appears adequate.",
      confidence: 0.94,
      consequenceLevel: "medium",
      evidence: overloaded.map((item) => ({
        source: "work",
        fact: "A member has a high number of concurrent active work orders.",
        recordIds: item.workOrderIds,
        metrics: [metric("active_work_orders", item.activeWorkCount, "count")],
      })),
      riskFlags: ["capacity", "concentration"],
    });
  }

  if (context.blockedWork.length > 0) {
    findings.push({
      domain: "work",
      findingType: "blocked_work",
      severity: context.blockedWork.length >= 3 ? "high" : "medium",
      title: "Work is blocked",
      summary: `${context.blockedWork.length} active work order(s) are explicitly marked blocked.`,
      recommendation: "Ask the responsible member or steward to identify the blocking dependency, owner and next unblock action for each affected work order.",
      rationale: "Blocked work cannot reliably produce its expected outcome until the dependency is made explicit and owned by a human or system with authority to resolve it.",
      confidence: 0.99,
      consequenceLevel: "medium",
      evidence: [{
        source: "work",
        fact: "Work orders are currently in blocked status.",
        recordIds: context.blockedWork.map((work) => work.id),
        metrics: [metric("blocked_work_orders", context.blockedWork.length, "count")],
      }],
      riskFlags: ["delivery", "dependency"],
    });
  }

  if (context.overdueWork.length > 0) {
    findings.push({
      domain: "work",
      findingType: "overdue_work",
      severity: context.overdueWork.length >= 3 ? "high" : "medium",
      title: "Committed work is past its due date",
      summary: `${context.overdueWork.length} active work order(s) have a due date earlier than the management snapshot.`,
      recommendation: "Review each overdue commitment with the assignee, revise the delivery plan where needed, and communicate changed expectations to affected humans before creating additional load.",
      rationale: "Overdue work is an observable delivery risk; the system should surface it without assuming why it happened or assigning blame.",
      confidence: 0.99,
      consequenceLevel: "medium",
      evidence: [{
        source: "work",
        fact: "Active work orders have due dates earlier than the snapshot timestamp.",
        recordIds: context.overdueWork.map((work) => work.id),
        metrics: [metric("overdue_work_orders", context.overdueWork.length, "count")],
      }],
      riskFlags: ["delivery", "commitment"],
    });
  }

  if (context.unassignedReadyWork.length > 0) {
    findings.push({
      domain: "work",
      findingType: "ready_work_unassigned",
      severity: "medium",
      title: "Ready work has no owner",
      summary: `${context.unassignedReadyWork.length} work order(s) are ready but have no assigned member.`,
      recommendation: "A Work or People steward should match the ready work to available role capacity and member preferences, then make the assignment through the human authority layer.",
      rationale: "Ready-but-unowned work is a coordination gap, but automated assignment would bypass member fit and stewardship authority.",
      confidence: 0.99,
      consequenceLevel: "medium",
      evidence: [{
        source: "work",
        fact: "Ready work orders have no assigned member.",
        recordIds: context.unassignedReadyWork.map((work) => work.id),
        metrics: [metric("unassigned_ready_work", context.unassignedReadyWork.length, "count")],
      }],
      riskFlags: ["ownership", "throughput"],
    });
  }

  const recentMarginCents = snapshot.revenueLast30DaysCents - snapshot.expenseLast30DaysCents;
  if (snapshot.operatingCashCents < 0) {
    findings.push({
      domain: "finance",
      findingType: "negative_operating_cash",
      severity: "critical",
      title: "Operating cash is negative in the posted books",
      summary: `Posted Operating Cash is ${snapshot.operatingCashCents} cents.`,
      recommendation: "Freeze discretionary expansion and distributions until a human Finance Steward or administrator reconciles the cash position and approves a solvency response.",
      rationale: "Negative operating cash is a direct balance-sheet condition and should outrank discretionary growth activity.",
      confidence: 1,
      consequenceLevel: "critical",
      evidence: [{
        source: "accounting",
        fact: "Posted journal lines produce a negative Operating Cash balance.",
        metrics: [metric("operating_cash", snapshot.operatingCashCents, "cents")],
      }],
      riskFlags: ["solvency", "cash"],
    });
  }

  if (recentMarginCents < 0) {
    findings.push({
      domain: "finance",
      findingType: "negative_recent_margin",
      severity: "high",
      title: "Thirty-day expenses exceed earned revenue",
      summary: `The last 30 days show ${snapshot.revenueLast30DaysCents} cents of earned revenue and ${snapshot.expenseLast30DaysCents} cents of expense.`,
      recommendation: "Have Finance review the posted journal, recurring obligations and near-term revenue work before approving permanent cost growth or a distribution.",
      rationale: "A negative recent operating margin does not prove long-term distress, but it is a concrete reason to require additional human review before increasing fixed obligations.",
      confidence: 0.98,
      consequenceLevel: "high",
      evidence: [{
        source: "accounting",
        fact: "Posted expenses exceed posted earned revenue during the 30-day snapshot window.",
        metrics: [
          metric("revenue_30d", snapshot.revenueLast30DaysCents, "cents"),
          metric("expense_30d", snapshot.expenseLast30DaysCents, "cents"),
          metric("margin_30d", recentMarginCents, "cents"),
        ],
      }],
      riskFlags: ["margin", "fixed-cost-growth"],
    });
  }

  if (snapshot.reserveRunwayMonths !== null && snapshot.reserveRunwayMonths < 6) {
    findings.push({
      domain: "finance",
      findingType: "reserve_runway_below_policy",
      severity: snapshot.reserveRunwayMonths < 3 ? "high" : "medium",
      title: "Reserve runway is below the six-month growth policy",
      summary: `Reserve cash currently represents approximately ${snapshot.reserveRunwayMonths.toFixed(2)} months of the last 30 days of posted expenses.`,
      recommendation: "Prioritize rebuilding reserve capacity and require explicit human review before permanent expansion or discretionary distributions reduce resilience further.",
      rationale: "The Charter growth policy uses six months of downside runway as the default safety threshold; the calculated reserve position is below that threshold.",
      confidence: 0.96,
      consequenceLevel: snapshot.reserveRunwayMonths < 3 ? "high" : "medium",
      evidence: [{
        source: "accounting",
        fact: "Reserve runway calculated from posted Reserve Cash and the most recent 30 days of posted expenses is below six months.",
        metrics: [
          metric("reserve_cash", snapshot.reserveCashCents, "cents"),
          metric("expense_30d", snapshot.expenseLast30DaysCents, "cents"),
          metric("reserve_runway", snapshot.reserveRunwayMonths, "months"),
        ],
      }],
      riskFlags: ["reserve", "runway"],
    });
  }

  if (context.qualityBlocks.length > 0) {
    findings.push({
      domain: "quality",
      findingType: "release_blockers",
      severity: snapshot.openQualityBlockCount >= 4 ? "high" : "medium",
      title: "Work in human review still has release-blocking quality conditions",
      summary: `${context.qualityBlocks.length} work order(s) in human review currently have ${snapshot.openQualityBlockCount} unresolved release-blocking standard(s).`,
      recommendation: "Quality Steward should review the evidence for each blocking standard. Failed or missing standards should be remediated; waivers remain administrator-only and require a written reason.",
      rationale: "The platform should not convert schedule pressure into a lower quality bar. Release blockers are explicit conditions in the quality system.",
      confidence: 0.99,
      consequenceLevel: "high",
      evidence: context.qualityBlocks.map((item) => ({
        source: "quality",
        fact: "A work order in human review has unresolved release-blocking quality standards.",
        recordIds: [item.workOrderId, ...item.standardIds],
        metrics: [metric("blocking_standards", item.blockingCount, "count")],
      })),
      riskFlags: ["release-gate", "quality"],
    });
  }

  if (context.unsafeGrowthPlanIds.length > 0) {
    findings.push({
      domain: "growth",
      findingType: "unsafe_growth_proposals",
      severity: "high",
      title: "Growth proposals currently fail the financial safety gate",
      summary: `${context.unsafeGrowthPlanIds.length} growth proposal(s) in human review are marked unsafe by the growth evaluator.`,
      recommendation: "Reject or defer these proposals unless the administrator has new evidence that changes the underlying numbers. Any override must remain explicit and audited.",
      rationale: "The system should not normalize overriding its own solvency gate merely because a hiring or expansion proposal is desirable.",
      confidence: 0.99,
      consequenceLevel: "high",
      evidence: [{
        source: "growth",
        fact: "Growth plans in human review have safe_to_add=false.",
        recordIds: context.unsafeGrowthPlanIds,
        metrics: [metric("unsafe_growth_plans", context.unsafeGrowthPlanIds.length, "count")],
      }],
      riskFlags: ["growth-gate", "solvency"],
    });
  }

  const canConsiderCapacityExpansion = snapshot.activeMemberCount > 0
    && snapshot.workPerActiveMember >= 4
    && snapshot.reserveRunwayMonths !== null
    && snapshot.reserveRunwayMonths >= 6
    && recentMarginCents > 0
    && snapshot.operatingCashCents > 0;

  if (canConsiderCapacityExpansion && snapshot.reserveRunwayMonths !== null) {
    findings.push({
      domain: "growth",
      findingType: "capacity_pressure_with_financial_buffer",
      severity: "medium",
      title: "Capacity pressure may justify a human growth evaluation",
      summary: `The network averages ${snapshot.workPerActiveMember.toFixed(2)} active work orders per active member while recent margin, operating cash and reserve runway are positive.`,
      recommendation: "Ask the Growth Steward to evaluate whether workload is persistent enough to justify an additional permanent role, contractor capacity, automation, or redistribution. Do not treat this signal as an automatic hiring recommendation.",
      rationale: "Workload pressure plus financial resilience is enough to justify analysis, but not enough to determine which expansion option is best or whether demand is durable.",
      confidence: 0.85,
      consequenceLevel: "medium",
      evidence: [{
        source: "growth",
        fact: "Workload pressure and current financial buffer satisfy the threshold for a capacity evaluation.",
        metrics: [
          metric("work_per_active_member", snapshot.workPerActiveMember, "count"),
          metric("reserve_runway", snapshot.reserveRunwayMonths, "months"),
          metric("margin_30d", recentMarginCents, "cents"),
          metric("operating_cash", snapshot.operatingCashCents, "cents"),
        ],
      }],
      riskFlags: ["capacity", "growth-evaluation"],
    });
  }

  return findings;
}
