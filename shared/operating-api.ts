import type { AuthorityStatus } from "./access";
import type { AccountingMetadata } from "./accounting-schema";
import type {
  AiDecisionStatus,
  ConsequenceLevel,
  DistributionStatus,
  GrowthAnalysis,
  GrowthPlanStatus,
  OperatingDomain,
  RoleAssignmentStatus,
  WorkOrderStatus,
} from "./operating-schema";

export interface OperatingPersonApi {
  id: number;
  displayName: string;
  email?: string;
}

export interface CharterRoleApi {
  id: number;
  name: string;
  domain: OperatingDomain;
  description: string;
  revenueResponsibility: string | null;
  humanAuthority: boolean;
  active: boolean;
  createdAt: string;
}

export interface RoleAssignmentApi {
  id: number;
  roleId: number;
  memberId: number;
  status: RoleAssignmentStatus;
  compensationCentsMonthly: number;
  assignedAt: string;
  notes: string | null;
}

export interface WorkOrderApi {
  id: number;
  title: string;
  description: string;
  revenueType: string;
  expectedRevenueCents: number;
  reportedRevenueCents: number;
  assignedMemberId: number | null;
  assignedRoleId: number | null;
  createdByMemberId: number | null;
  status: WorkOrderStatus;
  dueAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface JournalSummaryApi {
  id: number;
  occurredAt: string;
  description: string;
  status: "draft" | "posted" | "voided";
  recordedByMemberId: number | null;
  approvedByMemberId: number | null;
  metadata: AccountingMetadata;
  createdAt: string;
  debitCents: number;
  creditCents: number;
}

export interface DistributionPeriodApi {
  id: number;
  name: string;
  periodStart: string;
  periodEnd: string;
  revenueCents: number;
  operatingCostsCents: number;
  reserveContributionCents: number;
  distributableCents: number;
  status: DistributionStatus;
  approvedByMemberId: number | null;
  approvedAt: string | null;
  createdAt: string;
}

export interface GrowthPlanApi {
  id: number;
  proposedRoleName: string;
  monthlyCompensationCents: number;
  currentCashCents: number;
  recurringMonthlyRevenueCents: number;
  recurringMonthlyCostsCents: number;
  requiredReserveMonths: string;
  safeToAdd: boolean;
  analysis: GrowthAnalysis;
  status: GrowthPlanStatus;
  createdAt: string;
  approvedByMemberId: number | null;
  approvedAt: string | null;
}

export interface AiDecisionApi {
  id: number;
  domain: OperatingDomain;
  actionType: string;
  title: string;
  recommendation: string;
  rationale: string;
  confidence: string;
  expectedImpact: Record<string, unknown>;
  riskFlags: string[];
  consequenceLevel: ConsequenceLevel;
  status: AiDecisionStatus;
  proposedBy: string;
  reviewedByMemberId: number | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  executedByMemberId: number | null;
  executedAt: string | null;
  createdAt: string;
}

export interface OperatingTotalsApi {
  revenueCents: number;
  expenseCents: number;
  operatingCashCents: number;
  reserveCashCents: number;
}

export interface OperatingSummaryApi {
  access: AuthorityStatus;
  roles: CharterRoleApi[];
  assignments: RoleAssignmentApi[];
  work: WorkOrderApi[];
  journal: JournalSummaryApi[];
  growth: GrowthPlanApi[];
  decisions: AiDecisionApi[];
  distributions: DistributionPeriodApi[];
  people: OperatingPersonApi[];
  totals: OperatingTotalsApi;
}

export interface AuthorityAuditApi {
  id: number;
  actorMemberId: number | null;
  actorEmail: string | null;
  authority: string;
  action: string;
  targetType: string;
  targetId: string | null;
  outcome: string;
  reason: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}
