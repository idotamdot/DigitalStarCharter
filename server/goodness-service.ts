import { and, desc, eq } from "drizzle-orm";
import { db } from "./db";
import { goodnessCriteria, goodnessReviews, type GoodnessCriterion, type GoodnessReview } from "@shared/goodness-schema";

interface GoodnessCriterionSeed {
  key: string;
  name: string;
  description: string;
  question: string;
}

export const DEFAULT_GOODNESS_CRITERIA: readonly GoodnessCriterionSeed[] = [
  {
    key: "human-flourishing",
    name: "Human dignity & flourishing",
    description: "The thing should support human dignity, capability, wellbeing, autonomy or meaningful flourishing rather than treating people as disposable inputs.",
    question: "Does this improve or protect human flourishing without degrading anyone's basic dignity?",
  },
  {
    key: "non-extraction",
    name: "Non-extraction & fair exchange",
    description: "Value should not depend on coercion, hidden exploitation, predatory dependence, deceptive lock-in or systematically taking more from people than the exchange fairly returns.",
    question: "Is the exchange fair, understandable and free of coercive or extractive design?",
  },
  {
    key: "avoidable-harm",
    name: "Avoidable-harm reduction",
    description: "Foreseeable physical, psychological, financial, social and digital harms should be reduced at the design stage rather than externalized onto others.",
    question: "Have material foreseeable harms been identified and reduced as far as reasonably possible?",
  },
  {
    key: "truthfulness",
    name: "Truthfulness & epistemic integrity",
    description: "Claims, interfaces, measurements and representations should not intentionally deceive, manufacture false certainty or disguise important limitations.",
    question: "Can we describe what this is, does and does not know without deception or material omission?",
  },
  {
    key: "consent-agency-privacy",
    name: "Consent, privacy & agency",
    description: "People affected by the thing should retain meaningful agency, informed consent where appropriate, and proportionate privacy protections.",
    question: "Does this respect informed choice, personal agency and data/privacy boundaries?",
  },
  {
    key: "accessibility-inclusion",
    name: "Accessibility & inclusion",
    description: "The design should avoid excluding people unnecessarily and should include reasonable accessibility from the beginning rather than as an afterthought.",
    question: "Have we designed for reasonable access and avoided unnecessary exclusion?",
  },
  {
    key: "ecological-responsibility",
    name: "Ecological responsibility",
    description: "The thing should minimize unnecessary environmental damage, waste and depletion and prefer durable, efficient or regenerative choices where practical.",
    question: "Is the environmental cost proportionate, minimized and justified by the benefit?",
  },
  {
    key: "shared-benefit",
    name: "Shared benefit",
    description: "Benefits should not be intentionally concentrated by pushing disproportionate risk, cost or burden onto workers, users, communities or future generations.",
    question: "Are benefits and burdens distributed in a way we can defend as fair?",
  },
  {
    key: "human-oversight-ai",
    name: "Human oversight & contestability",
    description: "When AI materially affects people, money, opportunity, rights or access, humans must retain understandable review, challenge and override mechanisms.",
    question: "Can affected humans understand, challenge and obtain human review of consequential automated decisions?",
  },
  {
    key: "accountability-repairability",
    name: "Accountability & repairability",
    description: "There should be a clear owner for consequences, records of consequential decisions, and a practical path to correct, reverse, repair or compensate for mistakes where possible.",
    question: "If this causes harm or is wrong, can we identify responsibility and make a meaningful repair?",
  },
];

export interface GoodnessGateBlocker {
  criterionId: number;
  criterionKey: string;
  criterionName: string;
  status: "missing" | "pending" | "failed" | "needs_revision";
}

export interface GoodnessGateResult {
  clear: boolean;
  blockers: GoodnessGateBlocker[];
}

export async function ensureDefaultGoodnessCriteria(createdByMemberId: number): Promise<GoodnessCriterion[]> {
  const existing = await db.select().from(goodnessCriteria).orderBy(goodnessCriteria.id);
  const existingKeys = new Set(existing.map((criterion) => criterion.key));
  const missing = DEFAULT_GOODNESS_CRITERIA.filter((criterion) => !existingKeys.has(criterion.key));

  if (missing.length > 0) {
    await db.insert(goodnessCriteria).values(missing.map((criterion) => ({
      ...criterion,
      nonWaivable: true,
      active: true,
      createdByMemberId,
    })));
  }
  return db.select().from(goodnessCriteria).orderBy(goodnessCriteria.id);
}

export async function evaluateGoodnessGate(workOrderId: number): Promise<GoodnessGateResult> {
  const criteria = await db.select().from(goodnessCriteria).where(eq(goodnessCriteria.active, true));
  if (criteria.length === 0) return { clear: false, blockers: [] };

  const reviews = await db.select().from(goodnessReviews)
    .where(eq(goodnessReviews.workOrderId, workOrderId))
    .orderBy(desc(goodnessReviews.createdAt));
  const latestByCriterion = new Map<number, GoodnessReview>();
  for (const review of reviews) {
    if (!latestByCriterion.has(review.criterionId)) latestByCriterion.set(review.criterionId, review);
  }

  const blockers: GoodnessGateBlocker[] = [];
  for (const criterion of criteria) {
    const review = latestByCriterion.get(criterion.id);
    if (!review) {
      blockers.push({ criterionId: criterion.id, criterionKey: criterion.key, criterionName: criterion.name, status: "missing" });
      continue;
    }
    if (review.status !== "passed") {
      blockers.push({ criterionId: criterion.id, criterionKey: criterion.key, criterionName: criterion.name, status: review.status });
    }
  }
  return { clear: blockers.length === 0, blockers };
}
