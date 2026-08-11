import { boolean, integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { z } from "zod";
import { members } from "./identity-schema";

export const goodnessReviewStatusSchema = z.enum(["pending", "passed", "failed", "needs_revision"]);
export type GoodnessReviewStatus = z.infer<typeof goodnessReviewStatusSchema>;

export const goodnessSubjectTypeSchema = z.enum([
  "work",
  "product",
  "service",
  "venture",
  "partnership",
  "major_purchase",
  "ai_capability",
  "expansion",
]);
export type GoodnessSubjectType = z.infer<typeof goodnessSubjectTypeSchema>;

export const goodnessCriteria = pgTable("goodness_criteria", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  question: text("question").notNull(),
  nonWaivable: boolean("non_waivable").default(true).notNull(),
  active: boolean("active").default(true).notNull(),
  createdByMemberId: integer("created_by_member_id").references(() => members.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const goodnessSubjects = pgTable("goodness_subjects", {
  id: serial("id").primaryKey(),
  subjectType: text("subject_type").$type<GoodnessSubjectType>().notNull(),
  sourceId: text("source_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").default("proposed").notNull(),
  createdByMemberId: integer("created_by_member_id").references(() => members.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  sourceUnique: uniqueIndex("goodness_subjects_source_unique").on(table.subjectType, table.sourceId),
}));

export const goodnessReviews = pgTable("goodness_reviews", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").references(() => goodnessSubjects.id, { onDelete: "cascade" }).notNull(),
  criterionId: integer("criterion_id").references(() => goodnessCriteria.id, { onDelete: "restrict" }).notNull(),
  status: text("status").$type<GoodnessReviewStatus>().default("pending").notNull(),
  reviewerMemberId: integer("reviewer_member_id").references(() => members.id, { onDelete: "set null" }),
  evidence: text("evidence"),
  notes: text("notes"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const goodnessSubjectInputSchema = z.object({
  subjectType: goodnessSubjectTypeSchema,
  sourceId: z.string().trim().min(1).max(200),
  title: z.string().trim().min(1).max(300),
  description: z.string().trim().min(1).max(6000),
});

export const goodnessReviewInputSchema = z.object({
  subjectId: z.number().int().positive(),
  criterionId: z.number().int().positive(),
  status: goodnessReviewStatusSchema,
  evidence: z.string().trim().min(1).max(6000).nullable().optional(),
  notes: z.string().trim().max(4000).nullable().optional(),
}).superRefine((value, context) => {
  if (value.status === "passed" && !value.evidence?.trim()) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["evidence"], message: "Evidence is required to pass a Goodness criterion" });
  }
  if ((value.status === "failed" || value.status === "needs_revision") && !value.notes?.trim()) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["notes"], message: "Notes are required when a criterion does not pass" });
  }
});

export type GoodnessCriterion = typeof goodnessCriteria.$inferSelect;
export type GoodnessSubject = typeof goodnessSubjects.$inferSelect;
export type GoodnessReview = typeof goodnessReviews.$inferSelect;
export type GoodnessSubjectInput = z.infer<typeof goodnessSubjectInputSchema>;
export type GoodnessReviewInput = z.infer<typeof goodnessReviewInputSchema>;
