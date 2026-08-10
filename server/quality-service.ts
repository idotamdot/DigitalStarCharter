import { and, eq, isNull, or } from "drizzle-orm";
import { db } from "./db";
import { qualityReviews, qualityStandards } from "@shared/quality-schema";

export interface QualityGateResult {
  clear: boolean;
  blocking: Array<{
    standardId: number;
    standardName: string;
    status: "missing" | "pending" | "failed";
  }>;
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
