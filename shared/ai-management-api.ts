import type {
  ManagementEvidenceItem,
  ManagementFindingSeverity,
  ManagementRunMode,
  ManagementRunStatus,
  ManagementSnapshot,
} from "./ai-management-schema";
import type { ConsequenceLevel, OperatingDomain } from "./operating-schema";

export interface ManagementRunApi {
  id: number;
  status: ManagementRunStatus;
  mode: ManagementRunMode;
  requestedByMemberId: number | null;
  provider: string;
  model: string | null;
  snapshot: ManagementSnapshot | null;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
}

export interface ManagementFindingApi {
  id: number;
  runId: number;
  domain: OperatingDomain;
  findingType: string;
  severity: ManagementFindingSeverity;
  title: string;
  summary: string;
  recommendation: string;
  rationale: string;
  confidence: string;
  consequenceLevel: ConsequenceLevel;
  evidence: ManagementEvidenceItem[];
  decisionId: number | null;
  createdAt: string;
}

export interface ManagementRunDetailApi {
  run: ManagementRunApi;
  findings: ManagementFindingApi[];
}

export interface RunManagementCycleResponseApi extends ManagementRunDetailApi {
  proposalCount: number;
  synthesisSummary: string | null;
}

export interface ManagementEngineStatusApi {
  hybridConfigured: boolean;
  deterministicAvailable: true;
}
