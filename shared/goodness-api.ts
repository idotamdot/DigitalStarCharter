import type { GoodnessCriterion, GoodnessReview, GoodnessReviewStatus, GoodnessSubject } from "./goodness-schema";

export interface GoodnessGateBlockerApi {
  criterionId: number;
  criterionKey: string;
  criterionName: string;
  status: "missing" | GoodnessReviewStatus;
}

export interface GoodnessGateResultApi {
  clear: boolean;
  blockers: GoodnessGateBlockerApi[];
}

export interface GoodnessSubjectStateApi {
  subject: GoodnessSubject;
  criteria: GoodnessCriterion[];
  reviews: GoodnessReview[];
  gate: GoodnessGateResultApi;
}

export type GoodnessWorkStateApi = GoodnessSubjectStateApi;
