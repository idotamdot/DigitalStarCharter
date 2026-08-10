import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { members } from "./identity-schema";

export const resourceAccessLevelSchema = z.enum(["open", "member", "steward"]);
export type ResourceAccessLevel = z.infer<typeof resourceAccessLevelSchema>;

export const resourceContentTypeSchema = z.enum([
  "article",
  "guide",
  "template",
  "video",
  "course",
  "tool",
  "reference",
]);
export type ResourceContentType = z.infer<typeof resourceContentTypeSchema>;

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  contentType: text("content_type").$type<ResourceContentType>().notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  accessLevel: text("access_level").$type<ResourceAccessLevel>().default("member").notNull(),
  createdByMemberId: integer("created_by_member_id").references(() => members.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertResourceSchema = createInsertSchema(resources, {
  contentType: resourceContentTypeSchema,
  accessLevel: resourceAccessLevelSchema,
}).omit({ id: true, createdAt: true, updatedAt: true });

export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;

export interface ResourceApi {
  id: number;
  title: string;
  description: string;
  category: string;
  contentType: ResourceContentType;
  url: string;
  thumbnailUrl: string | null;
  accessLevel: ResourceAccessLevel;
  createdByMemberId: number | null;
  createdAt: string;
  updatedAt: string;
}
