import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";

export const memberStatusSchema = z.enum(["active", "paused", "departed"]);
export type MemberStatus = z.infer<typeof memberStatusSchema>;

export const memberSkillsSchema = z.object({
  primary: z.array(z.string().trim().min(1).max(100)).max(50),
  developing: z.array(z.string().trim().min(1).max(100)).max(50),
});
export type MemberSkills = z.infer<typeof memberSkillsSchema>;

export const memberPreferencesSchema = z.object({
  preferredWork: z.array(z.string().trim().min(1).max(160)).max(50),
  avoidWork: z.array(z.string().trim().min(1).max(160)).max(50),
  communication: z.array(z.string().trim().min(1).max(160)).max(20),
});
export type MemberPreferences = z.infer<typeof memberPreferencesSchema>;

export const memberConstraintsSchema = z.object({
  schedule: z.string().trim().max(1000).optional(),
  mobility: z.string().trim().max(1000).optional(),
  accessibility: z.array(z.string().trim().min(1).max(200)).max(50).optional(),
  notes: z.string().trim().max(2000).optional(),
});
export type MemberConstraints = z.infer<typeof memberConstraintsSchema>;

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  authSubject: text("auth_subject").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  status: text("status").$type<MemberStatus>().default("active").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const memberProfiles = pgTable("member_profiles", {
  memberId: integer("member_id").primaryKey().references(() => members.id, { onDelete: "cascade" }),
  skills: jsonb("skills").$type<MemberSkills>().default({ primary: [], developing: [] }).notNull(),
  preferences: jsonb("preferences").$type<MemberPreferences>().default({ preferredWork: [], avoidWork: [], communication: [] }).notNull(),
  constraints: jsonb("constraints").$type<MemberConstraints>().default({}).notNull(),
  learningGoals: jsonb("learning_goals").$type<string[]>().default([]).notNull(),
  availabilityNotes: text("availability_notes"),
  roleFitNotes: text("role_fit_notes"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const updateMemberIdentitySchema = z.object({
  displayName: z.string().trim().min(1).max(160).optional(),
});

export const updateMemberProfileSchema = z.object({
  skills: memberSkillsSchema.optional(),
  preferences: memberPreferencesSchema.optional(),
  constraints: memberConstraintsSchema.optional(),
  learningGoals: z.array(z.string().trim().min(1).max(200)).max(50).optional(),
  availabilityNotes: z.string().trim().max(2000).nullable().optional(),
});

export type Member = typeof members.$inferSelect;
export type MemberProfile = typeof memberProfiles.$inferSelect;
export type UpdateMemberProfileInput = z.infer<typeof updateMemberProfileSchema>;
