import { boolean, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export type MemberStatus = "active" | "paused" | "departed";

export interface MemberSkills {
  primary: string[];
  developing: string[];
}

export interface MemberPreferences {
  preferredWork: string[];
  avoidWork: string[];
  communication: string[];
}

export interface MemberConstraints {
  schedule?: string;
  mobility?: string;
  accessibility?: string[];
  notes?: string;
}

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
  memberId: serial("member_id").primaryKey().references(() => members.id, { onDelete: "cascade" }),
  skills: jsonb("skills").$type<MemberSkills>().default({ primary: [], developing: [] }).notNull(),
  preferences: jsonb("preferences").$type<MemberPreferences>().default({ preferredWork: [], avoidWork: [], communication: [] }).notNull(),
  constraints: jsonb("constraints").$type<MemberConstraints>().default({}).notNull(),
  learningGoals: jsonb("learning_goals").$type<string[]>().default([]).notNull(),
  availabilityNotes: text("availability_notes"),
  roleFitNotes: text("role_fit_notes"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Member = typeof members.$inferSelect;
export type MemberProfile = typeof memberProfiles.$inferSelect;
