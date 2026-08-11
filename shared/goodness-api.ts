import type { GoodnessCriterion, GoodnessReview } from "./goodness-schema";
import type { GoodnessGateResult } from "../server/goodness-service";

export interface GoodnessWorkStateApi {
  criteria: GoodnessCriterion[];
  reviews: GoodnessReview[];
  gate: GoodnessGateResult;
}
