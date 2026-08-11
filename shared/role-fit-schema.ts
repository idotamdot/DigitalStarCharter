import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";
import { charterRoles } from "./operating-schema";

export const roleRequirementTagsSchema = z.object({
  requiredSkills: z.array(z.string().trim().min(1).max(100)).max(40),
  helpfulSkills: z.array(z.string().trim().min(1).max(100)).max(40),
  workCharacteristics: z.array(z.string().trim().min(1).max(120)).max(40),
  learningTags: z.array(z.string().trim().min(1).max(100)).max(40),
});
export type RoleRequirementTags = z.infer<typeof roleRequirementTagsSchema>;

export const roleProfiles = pgTable("role_profiles", {
  roleId: integer("role_id").primaryKey().references(() => charterRoles.id, { onDelete: "cascade" }),
  requiredSkills: jsonb("required_skills").$type<string[]>().default([]).notNull(),
  helpfulSkills: jsonb("helpful_skills").$type<string[]>().default([]).notNull(),
  workCharacteristics: jsonb("work_characteristics").$type<string[]>().default([]).notNull(),
  learningTags: jsonb("learning_tags").$type<string[]>().default([]).notNull(),
  notes: text("notes"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const updateRoleProfileSchema = roleRequirementTagsSchema.extend({
  notes: z.string().trim().max(2000).nullable().optional(),
});

export interface RoleFitBreakdown {
  requiredSkillScore: number;
  helpfulSkillScore: number;
  preferenceScore: number;
}

export interface RoleFitResult {
  roleId: number;
  roleName: string;
  domain: string;
  configured: boolean;
  score: number | null;
  breakdown: RoleFitBreakdown | null;
  matchedRequiredSkills: string[];
  missingRequiredSkills: string[];
  matchedHelpfulSkills: string[];
  matchedWorkPreferences: string[];
  preferenceDiscussionFlags: string[];
  learningTags: string[];
  accommodationDiscussion: {
    hasScheduleConstraint: boolean;
    hasMobilityConstraint: boolean;
    hasAccessibilityNeeds: boolean;
  };
  explanation: string;
}

export type RoleProfile = typeof roleProfiles.$inferSelect;
export type UpdateRoleProfileInput = z.infer<typeof updateRoleProfileSchema>;
