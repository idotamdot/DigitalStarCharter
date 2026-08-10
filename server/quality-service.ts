import { and, eq, isNull, or } from "drizzle-orm";
import { db } from "./db";
import { qualityReviews, qualityStandards, type QualityStandard } from "@shared/quality-schema";

const defaultQualityStandards = [
  {
    name: "Requirements fulfilled",
    description: "The delivered work satisfies the agreed scope, acceptance criteria and promised outcome.",
    appliesToRevenueType: null,
    releaseBlocking: true,
    active: true,
  },
  {
    name: "Accuracy and completeness",
    description: "Claims, calculations, content and deliverables have been checked for material errors, omissions and unfinished work.",
    appliesToRevenueType: null,
    releaseBlocking: true,
    active: true,
  },
  {
    name: "Privacy and safety obligations",
    description: "The work does not expose protected information or bypass applicable safety, security or consent obligations.",
    appliesToRevenueType: null,
    releaseBlocking: true,
    active: true,
  },
  {
    name: "Usability and presentation",
    description: "The finished work is understandable, usable and presented at the quality level the network is willing to stand behind.",
    appliesToRevenueType: null,
    releaseBlocking: true,
    active: true,
  },
] as const;

export interface QualityGateResult {
  clear: boolean;
  blocking: Array<{
    standardId: number;
    standardName: string;
    status: "missing" | "pending" | "failed";
  }>;
}

export async function ensureDefaultQualityStandards(createdByMemberId: number): Promise<QualityStandard[]> {
  const existing = await db.select().from(qualityStandards).orderBy(qualityStandards.id);
  if (existing.length > 0) return existing;

  await db.insert(qualityStandards).values(defaultQualityStandards.map((standard) => ({
    ...standard,
    createdByMemberId,
  })));
  return db.select().from(qualityStandards).orderBy(qualityStandards.id);
}

export async function evaluateWorkQualityGate(workOrderId: number, revenueType: string): Promise<QualityGateResult> {
  const standards = await db.select().from(qualityStandards).where(and(
    eq(qualityStandards.active, true),
    eq(qualityStandards.releaseBlocking, true),
    or(
      isNull(qualityStandards.appliesToRevenueType),
      eq(qualityStandards.appliesToRevenueType, revenueType),
    ),
  ));

  if (standards.length === 0) return { clear: true, blocking: [] };

  const reviews = await db.select().from(qualityReviews).where(eq(qualityReviews.workOrderId, workOrderId));
  const latestByStandard = new Map<number, typeof reviews[number]>();
  for (const review of reviews) {
    const current = latestByStandard.get(review.standardId);
    if (!current || current.createdAt < review.createdAt) latestByStandard.set(review.standardId, review);
  }

  const blocking: QualityGateResult["blocking"] = [];
  for (const standard of standards) {
    const review = latestByStandard.get(standard.id);
    if (!review) {
      blocking.push({ standardId: standard.id, standardName: standard.name, status: "missing" });
      continue;
    }
    if (review.status === "pending" || review.status === "failed") {
      blocking.push({ standardId: standard.id, standardName: standard.name, status: review.status });
    }
  }

  return { clear: blocking.length === 0, blocking };
}
