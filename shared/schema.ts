import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User account
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  businessType: text("business_type"),
  createdAt: timestamp("created_at").defaultNow(),
  starName: text("star_name"), // Unique name for this member's star in the constellation
  region: text("region"), // Geographic region (state/province/country)
  role: text("role"), // Role in the constellation
  starPosition: jsonb("star_position"), // {x, y} coordinates in the constellation
  starColor: text("star_color"), // The color of the member's star
  starSize: numeric("star_size"), // The size of the member's star (based on contributions/reputation)
  joinedDate: date("joined_date").defaultNow(), // When the member joined
});

// Business profiles for users
export const businessProfiles = pgTable("business_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  businessName: text("business_name").notNull(),
  industry: text("industry"),
  description: text("description"),
  stage: text("stage"), // idea, planning, established, etc.
  targetAudience: text("target_audience"),
  location: text("location"),
  website: text("website"),
  wizardProgress: jsonb("wizard_progress"), // Store progress through the business wizard
  completedSteps: jsonb("completed_steps"), // Track which development steps have been completed
});

// Branding information
export const brandingInfo = pgTable("branding_info", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color"),
  secondaryColor: text("secondary_color"),
  typography: text("typography"),
  brandValues: jsonb("brand_values"), // Array of brand values
  tagline: text("tagline"),
  missionStatement: text("mission_statement"),
});

// Social media planning
export const socialMediaPlans = pgTable("social_media_plans", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  platforms: jsonb("platforms"), // Array of selected platforms
  targetAudience: text("target_audience"),
  contentThemes: jsonb("content_themes"), // Array of content themes
  postFrequency: text("post_frequency"),
  goals: jsonb("goals"), // Goals for social media
});

// Subscription/service tier information
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  tier: text("tier").notNull(), // self-guided, growth, premium
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").notNull().default(true),
  paymentInfo: jsonb("payment_info"),
});

// Resources for the resource library
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // business, marketing, branding, etc.
  contentType: text("content_type").notNull(), // article, template, video, etc.
  url: text("url").notNull(),
  thumbnail: text("thumbnail"),
  isPublic: boolean("is_public").notNull().default(true),
  requiredTier: text("required_tier"), // Which tier is needed to access this resource
});

// Constellation data
export const constellations = pgTable("constellations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // Name of this constellation (e.g., "The Texas Network")
  region: text("region").notNull(), // Geographic region (e.g., "Texas")
  founderUserId: integer("founder_user_id").notNull(), // The founder of this constellation
  createdAt: timestamp("created_at").defaultNow(),
  description: text("description"),
  centerPoint: jsonb("center_point"), // {x, y} coordinates for the center of this constellation
  connections: jsonb("connections"), // Array of connection data between stars
  backgroundTheme: text("background_theme"), // The visual theme for this constellation
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  businessType: true,
  starName: true,
  region: true,
  role: true,
  starColor: true,
});

export const insertBusinessProfileSchema = createInsertSchema(businessProfiles).omit({
  id: true
});

export const insertBrandingInfoSchema = createInsertSchema(brandingInfo).omit({
  id: true
});

export const insertSocialMediaPlanSchema = createInsertSchema(socialMediaPlans).omit({
  id: true
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true
});

export const insertConstellationSchema = createInsertSchema(constellations).omit({
  id: true,
  createdAt: true
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBusinessProfile = z.infer<typeof insertBusinessProfileSchema>;
export type BusinessProfile = typeof businessProfiles.$inferSelect;

export type InsertBrandingInfo = z.infer<typeof insertBrandingInfoSchema>;
export type BrandingInfo = typeof brandingInfo.$inferSelect;

export type InsertSocialMediaPlan = z.infer<typeof insertSocialMediaPlanSchema>;
export type SocialMediaPlan = typeof socialMediaPlans.$inferSelect;

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;

export type InsertConstellation = z.infer<typeof insertConstellationSchema>;
export type Constellation = typeof constellations.$inferSelect;
