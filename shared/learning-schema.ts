import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { users, resources } from "./schema";
import { learningSkillLevelSchema, learningTierSchema } from "./learning";

export const learningPaths = pgTable("learning_paths", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  skillLevel: text("skill_level").notNull(),
  estimatedHours: integer("estimated_hours").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  authorId: integer("author_id").references(() => users.id, { onDelete: "restrict" }).notNull(),
  requiredTier: text("required_tier").notNull().default("self-guided"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const learningPathSteps = pgTable("learning_path_steps", {
  id: serial("id").primaryKey(),
  pathId: integer("path_id").references(() => learningPaths.id, { onDelete: "cascade" }).notNull(),
  resourceId: integer("resource_id").references(() => resources.id, { onDelete: "restrict" }).notNull(),
  stepOrder: integer("step_order").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  estimatedMinutes: integer("estimated_minutes").notNull(),
  isRequired: boolean("is_required").default(true).notNull(),
});

export const userLearningEnrollments = pgTable("user_learning_enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  pathId: integer("path_id").references(() => learningPaths.id, { onDelete: "cascade" }).notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  isActive: boolean("is_active").default(true).notNull(),
  progressPercent: integer("progress_percent").default(0).notNull(),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow().notNull(),
});

export const userLearningProgress = pgTable("user_learning_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  pathId: integer("path_id").references(() => learningPaths.id, { onDelete: "cascade" }).notNull(),
  stepId: integer("step_id").references(() => learningPathSteps.id, { onDelete: "cascade" }).notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  resourceRating: integer("resource_rating"),
});

export const insertLearningPathDbSchema = createInsertSchema(learningPaths, {
  skillLevel: learningSkillLevelSchema,
  requiredTier: learningTierSchema,
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertLearningPathStepDbSchema = createInsertSchema(learningPathSteps).omit({ id: true });
export const insertUserLearningEnrollmentDbSchema = createInsertSchema(userLearningEnrollments).omit({
  id: true,
  enrolledAt: true,
  progressPercent: true,
  lastAccessedAt: true,
});
export const insertUserLearningProgressDbSchema = createInsertSchema(userLearningProgress).omit({
  id: true,
  startedAt: true,
});

export type LearningPathRow = typeof learningPaths.$inferSelect;
export type LearningPathStepRow = typeof learningPathSteps.$inferSelect;
export type LearningEnrollmentRow = typeof userLearningEnrollments.$inferSelect;
export type LearningProgressRow = typeof userLearningProgress.$inferSelect;
