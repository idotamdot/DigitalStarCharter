import { eq } from "drizzle-orm";
import { db } from "./db";
import { getAccountingTotals } from "./accounting-service";
import { evaluateWorkQualityGate } from "./quality-service";
import { members, memberProfiles } from "@shared/identity-schema";
import { learningEnrollments } from "@shared/learning-schema";
import { growthPlans, roleAssignments, workOrders, type WorkOrder } from "@shared/operating-schema";
import type { ManagementSnapshot } from "@shared/ai-management-schema";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface WorkloadByMember {
  memberId: number;
  activeWorkCount: number;
  workOrderIds: number[];
}

export interface QualityBlockSummary {
  workOrderId: number;
  blockingCount: number;
  standardIds: number[];
}

export interface ManagementContext {
  snapshot: ManagementSnapshot;
  activeMemberIds: number[];
  unassignedMemberIds: number[];
  incompleteProfileMemberIds: number[];
  blockedWork: WorkOrder[];
  overdueWork: WorkOrder[];
  unassignedReadyWork: WorkOrder[];
  workloadByMember: WorkloadByMember[];
  qualityBlocks: QualityBlockSummary[];
  unsafeGrowthPlanIds: number[];
}

function profileHasPlanningData(profile: typeof memberProfiles.$inferSelect): boolean {
  return profile.skills.primary.length > 0
    || profile.skills.developing.length > 0
    || profile.preferences.preferredWork.length > 0
    || profile.preferences.avoidWork.length > 0
    || profile.learningGoals.length > 0
    || Boolean(profile.availabilityNotes?.trim())
    || Boolean(profile.constraints.schedule?.trim())
    || Boolean(profile.constraints.mobility?.trim())
    || Boolean(profile.constraints.accessibility?.length);
}

export async function captureManagementContext(now = new Date()): Promise<ManagementContext> {
  const since30Days = new Date(now.getTime() - (30 * DAY_MS));

  const [
    memberRows,
    profileRows,
    assignmentRows,
    workRows,
    enrollmentRows,
    growthRows,
    lifetimeAccounting,
    recentAccounting,
  ] = await Promise.all([
    db.select().from(members).where(eq(members.isActive, true)),
    db.select().from(memberProfiles),
    db.select().from(roleAssignments).where(eq(roleAssignments.status, "active")),
    db.select().from(workOrders),
    db.select().from(learningEnrollments).where(eq(learningEnrollments.isActive, true)),
    db.select().from(growthPlans),
    getAccountingTotals(),
    getAccountingTotals(since30Days, now),
  ]);

  const activeMemberIds = memberRows
    .filter((member) => member.status === "active")
    .map((member) => member.id);
  const activeMemberSet = new Set(activeMemberIds);
  const assignedMemberSet = new Set(
    assignmentRows
      .map((assignment) => assignment.memberId)
      .filter((memberId) => activeMemberSet.has(memberId)),
  );
  const unassignedMemberIds = activeMemberIds.filter((memberId) => !assignedMemberSet.has(memberId));

  const profilesByMemberId = new Map(profileRows.map((profile) => [profile.memberId, profile]));
  const incompleteProfileMemberIds = activeMemberIds.filter((memberId) => {
    const profile = profilesByMemberId.get(memberId);
    return !profile || !profileHasPlanningData(profile);
  });

  const activeWork = workRows.filter((work) => work.status !== "completed" && work.status !== "cancelled");
  const blockedWork = activeWork.filter((work) => work.status === "blocked");
  const overdueWork = activeWork.filter((work) => Boolean(work.dueAt && work.dueAt.getTime() < now.getTime()));
  const unassignedReadyWork = activeWork.filter((work) => work.status === "ready" && work.assignedMemberId === null);

  const workloadMap = new Map<number, WorkloadByMember>();
  for (const work of activeWork) {
    if (work.assignedMemberId === null) continue;
    const current = workloadMap.get(work.assignedMemberId) ?? {
      memberId: work.assignedMemberId,
      activeWorkCount: 0,
      workOrderIds: [],
    };
    current.activeWorkCount += 1;
    current.workOrderIds.push(work.id);
    workloadMap.set(work.assignedMemberId, current);
  }
  const workloadByMember = [...workloadMap.values()].sort((a, b) => b.activeWorkCount - a.activeWorkCount);

  const qualityCandidateWork = activeWork.filter((work) => work.status === "human_review");
  const qualityBlocks = await Promise.all(qualityCandidateWork.map(async (work) => {
    const gate = await evaluateWorkQualityGate(work.id, work.revenueType);
    return {
      workOrderId: work.id,
      blockingCount: gate.blocking.length,
      standardIds: gate.blocking.map((item) => item.standardId),
    } satisfies QualityBlockSummary;
  }));
  const activeQualityBlocks = qualityBlocks.filter((item) => item.blockingCount > 0);

  const monthlyExpenseCents = recentAccounting.expenseCents;
  const reserveRunwayMonths = monthlyExpenseCents > 0
    ? lifetimeAccounting.reserveCashCents / monthlyExpenseCents
    : null;

  const activeLearningEnrollmentCount = enrollmentRows.filter((enrollment) => activeMemberSet.has(enrollment.memberId)).length;
  const activeWorkCount = activeWork.length;
  const workPerActiveMember = activeMemberIds.length > 0 ? activeWorkCount / activeMemberIds.length : 0;

  const snapshot: ManagementSnapshot = {
    capturedAt: now.toISOString(),
    activeMemberCount: activeMemberIds.length,
    activeAssignmentCount: assignmentRows.length,
    unassignedMemberCount: unassignedMemberIds.length,
    activeWorkCount,
    blockedWorkCount: blockedWork.length,
    overdueWorkCount: overdueWork.length,
    unassignedReadyWorkCount: unassignedReadyWork.length,
    openQualityBlockCount: activeQualityBlocks.reduce((sum, item) => sum + item.blockingCount, 0),
    activeLearningEnrollmentCount,
    revenueLast30DaysCents: recentAccounting.revenueCents,
    expenseLast30DaysCents: recentAccounting.expenseCents,
    operatingCashCents: lifetimeAccounting.operatingCashCents,
    reserveCashCents: lifetimeAccounting.reserveCashCents,
    reserveRunwayMonths,
    workPerActiveMember,
  };

  return {
    snapshot,
    activeMemberIds,
    unassignedMemberIds,
    incompleteProfileMemberIds,
    blockedWork,
    overdueWork,
    unassignedReadyWork,
    workloadByMember,
    qualityBlocks: activeQualityBlocks,
    unsafeGrowthPlanIds: growthRows.filter((plan) => plan.status === "human_review" && !plan.safeToAdd).map((plan) => plan.id),
  };
}
