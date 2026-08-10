import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { members } from "./identity-schema";
import { workOrders } from "./operating-schema";

export const qualityReviewStatusSchema = z.enum(["pending", "passed", "failed", "waived"]);
export type QualityReviewStatus = z.infer<typeof qualityReviewStatusSchema>;

export const qualityStandards = pgTable("quality_standards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  appliesToRevenueType: text("applies_to_revenue_type"),
  releaseBlocking: boolean("release_blocking").default(true).notNull(),
  active: boolean("active").default(true).notNull(),
  createdByMemberId: integer("created_by_member_id").references(() => members.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const qualityReviews = pgTable("quality_reviews", {
  id: serial("id").primaryKey(),
  workOrderId: integer("work_order_id").references(() => workOrders.id, { onDelete: "cascade" }).notNull(),
  standardId: integer("standard_id").references(() => qualityStandards.id, { onDelete: "restrict" }).notNull(),
  status: text("status").$type<QualityReviewStatus>().default("pending").notNull(),
  reviewerMemberId: integer("reviewer_member_id").references(() => members.id, { onDelete: "set null" }),
  evidence: text("evidence"),
  notes: text("notes"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertQualityStandardSchema = createInsertSchema(qualityStandards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const qualityReviewInputSchema = z.object({
  workOrderId: z.number().int().positive(),
  standardId: z.number().int().positive(),
  status: qualityReviewStatusSchema,
  evidence: z.string().trim().max(4000).nullable().optional(),
  notes: z.string().trim().max(4000).nullable().optional(),
});

export type QualityStandard = typeof qualityStandards.$inferSelect;
export type QualityReview = typeof qualityReviews.$inferSelect;
