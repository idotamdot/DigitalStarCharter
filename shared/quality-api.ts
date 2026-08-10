import type { QualityReviewStatus } from "./quality-schema";

export interface QualityStandardApi {
  id: number;
  name: string;
  description: string;
  appliesToRevenueType: string | null;
  releaseBlocking: boolean;
  active: boolean;
  createdByMemberId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface QualityReviewApi {
  id: number;
  workOrderId: number;
  standardId: number;
  status: QualityReviewStatus;
  reviewerMemberId: number | null;
  evidence: string | null;
  notes: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface QualityGateApi {
  clear: boolean;
  blocking: Array<{
    standardId: number;
    standardName: string;
    status: "missing" | "pending" | "failed";
  }>;
}

export interface WorkQualityApi {
  reviews: QualityReviewApi[];
  gate: QualityGateApi;
}
