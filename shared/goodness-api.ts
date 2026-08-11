import type { GoodnessCriterion, GoodnessReview, GoodnessReviewStatus } from "./goodness-schema";

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

export interface GoodnessWorkStateApi {
  criteria: GoodnessCriterion[];
  reviews: GoodnessReview[];
  gate: GoodnessGateResultApi;
}
