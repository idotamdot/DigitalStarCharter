import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date, numeric, time } from "drizzle-orm/pg-core";
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
  region: text("region"), // Geographic region (continent)
  subRegion: text("sub_region"), // Sub-region within the continent (area)
  role: text("role"), // Role in the constellation
  starPosition: jsonb("star_position"), // {x, y} coordinates in the constellation
  starColor: text("star_color"), // The color of the member's star
  starSize: numeric("star_size"), // The size of the member's star (based on contributions/reputation)
  joinedDate: date("joined_date").defaultNow(), // When the member joined
  isGuidingStar: boolean("is_guiding_star").default(false), // Continent founder/guiding star
  isAreaLeader: boolean("is_area_leader").default(false), // Leader of an area within a continent
  isVoter: boolean("is_voter").default(false), // Has voting privileges
  voterUntil: timestamp("voter_until"), // When voting privilege expires (for rotating voters)
  invitedBy: integer("invited_by"), // Who invited this member
  approvedBy: jsonb("approved_by"), // Array of user IDs who approved this member
  characterEvaluation: text("character_evaluation"), // Notes from character evaluation
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
  name: text("name").notNull().unique(), // Name of this constellation (e.g., "The North American Constellation")
  region: text("region").notNull(), // Geographic region (continent)
  founderUserId: integer("founder_user_id").notNull(), // The founder/guiding star of this constellation
  createdAt: timestamp("created_at").defaultNow(),
  description: text("description"),
  centerPoint: jsonb("center_point"), // {x, y} coordinates for the center of this constellation
  connections: jsonb("connections"), // Array of connection data between stars
  backgroundTheme: text("background_theme"), // The visual theme for this constellation
  totalAreas: integer("total_areas").default(30), // Number of areas within this constellation (default 30)
  activatedAreas: integer("activated_areas").default(0), // Number of areas that have been activated
});

// Continental Areas (sub-regions within continents)
export const areas = pgTable("areas", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Area name (e.g., "North America - Area 1")
  constellationId: integer("constellation_id").notNull(), // Parent constellation
  leaderId: integer("leader_id"), // Area leader (can be null if not assigned)
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  isActive: boolean("is_active").default(false), // Is this area activated with a leader
  maxMembers: integer("max_members").default(30), // Maximum members in this area (default 30)
  currentMembers: integer("current_members").default(0), // Current number of members
});

// Voting System
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(), // What is being voted on
  description: text("description").notNull(),
  createdBy: integer("created_by").notNull(), // User who created this vote
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  status: text("status").default("open"), // open, closed, approved, rejected
  votingPool: jsonb("voting_pool"), // Array of user IDs who can vote
  votesRequired: integer("votes_required").default(3), // How many unanimous votes needed
  votesReceived: jsonb("votes_received"), // Array of {userId, vote: true/false, timestamp}
  isUnanimous: boolean("is_unanimous").default(false), // Whether all votes are positive
});

// Forum system for continental guiding stars
export const forumTopics = pgTable("forum_topics", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  content: text("content").notNull(),
  category: text("category").notNull(), // Structure, Ideas, Updates, etc.
  isPinned: boolean("is_pinned").default(false),
  isLocked: boolean("is_locked").default(false),
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
});

// Forum replies
export const forumReplies = pgTable("forum_replies", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").notNull(),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  content: text("content").notNull(),
  isEdited: boolean("is_edited").default(false),
});

// Availability schedule for service providers
export const serviceProviderAvailability = pgTable("service_provider_availability", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  timeZone: text("time_zone").notNull().default("UTC"),
  isAvailable: boolean("is_available").default(true),
});

// Service offerings that can be booked
export const serviceOfferings = pgTable("service_offerings", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull(), // User ID of the service provider
  title: text("title").notNull(),
  description: text("description").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  price: numeric("price"),
  currency: text("currency").default("USD"),
  category: text("category").notNull(), // e.g., "Consultation", "Design Review", "Development", etc.
  requiredTier: text("required_tier"), // Subscription tier required to book this service
  maxBookingsPerDay: integer("max_bookings_per_day").default(5),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Scheduled appointments
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull(),
  clientId: integer("client_id").notNull(), // User ID of the client booking the appointment
  providerId: integer("provider_id").notNull(), // User ID of the service provider
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  timeZone: text("time_zone").notNull().default("UTC"),
  status: text("status").notNull().default("scheduled"), // scheduled, confirmed, completed, cancelled, no-show
  notes: text("notes"),
  meetingLink: text("meeting_link"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  reminderSent: boolean("reminder_sent").default(false),
  feedbackProvided: boolean("feedback_provided").default(false),
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
  subRegion: true,
  role: true,
  starColor: true,
  isGuidingStar: true,
  isAreaLeader: true,
  isVoter: true,
  invitedBy: true,
  characterEvaluation: true,
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
  createdAt: true,
  activatedAreas: true
});

export const insertAreaSchema = createInsertSchema(areas).omit({
  id: true,
  createdAt: true,
  currentMembers: true
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  createdAt: true,
  votesReceived: true,
  isUnanimous: true
});

export const insertForumTopicSchema = createInsertSchema(forumTopics).omit({
  id: true,
  createdAt: true,
  lastActivityAt: true
});

export const insertForumReplySchema = createInsertSchema(forumReplies).omit({
  id: true,
  createdAt: true,
  isEdited: true
});

export const insertServiceProviderAvailabilitySchema = createInsertSchema(serviceProviderAvailability).omit({
  id: true
});

export const insertServiceOfferingSchema = createInsertSchema(serviceOfferings).omit({
  id: true,
  createdAt: true
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  reminderSent: true,
  feedbackProvided: true
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

export type InsertArea = z.infer<typeof insertAreaSchema>;
export type Area = typeof areas.$inferSelect;

export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;

export type InsertForumTopic = z.infer<typeof insertForumTopicSchema>;
export type ForumTopic = typeof forumTopics.$inferSelect;

export type InsertForumReply = z.infer<typeof insertForumReplySchema>;
export type ForumReply = typeof forumReplies.$inferSelect;

export type InsertServiceProviderAvailability = z.infer<typeof insertServiceProviderAvailabilitySchema>;
export type ServiceProviderAvailability = typeof serviceProviderAvailability.$inferSelect;

export type InsertServiceOffering = z.infer<typeof insertServiceOfferingSchema>;
export type ServiceOffering = typeof serviceOfferings.$inferSelect;

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

// Learning Path Schema
export const learningPaths = pgTable("learning_paths", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  difficultyLevel: text("difficulty_level").notNull(), // "beginner", "intermediate", "advanced"
  estimatedHours: integer("estimated_hours").notNull(),
  category: text("category").notNull(), // Matches resource categories
  coverImageUrl: text("cover_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const learningPathSteps = pgTable("learning_path_steps", {
  id: serial("id").primaryKey(),
  pathId: integer("path_id").references(() => learningPaths.id, { onDelete: "cascade" }).notNull(),
  resourceId: integer("resource_id").references(() => resources.id).notNull(),
  stepOrder: integer("step_order").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  isRequired: boolean("is_required").default(true).notNull(),
});

export const userLearningProgress = pgTable("user_learning_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  pathId: integer("path_id").references(() => learningPaths.id, { onDelete: "cascade" }).notNull(),
  stepId: integer("step_id").references(() => learningPathSteps.id, { onDelete: "cascade" }).notNull(),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  resourceRating: integer("resource_rating"), // 1-5 star rating
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

export const insertLearningPathSchema = createInsertSchema(learningPaths).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertLearningPathStepSchema = createInsertSchema(learningPathSteps).omit({
  id: true,
});

export const insertUserLearningProgressSchema = createInsertSchema(userLearningProgress).omit({
  id: true,
});

export const insertUserLearningEnrollmentSchema = createInsertSchema(userLearningEnrollments).omit({
  id: true,
  enrolledAt: true,
  progressPercent: true,
  lastAccessedAt: true
});

export type InsertLearningPath = z.infer<typeof insertLearningPathSchema>;
export type LearningPath = typeof learningPaths.$inferSelect;

export type InsertLearningPathStep = z.infer<typeof insertLearningPathStepSchema>;
export type LearningPathStep = typeof learningPathSteps.$inferSelect;

export type InsertUserLearningProgress = z.infer<typeof insertUserLearningProgressSchema>;
export type UserLearningProgress = typeof userLearningProgress.$inferSelect;

export type InsertUserLearningEnrollment = z.infer<typeof insertUserLearningEnrollmentSchema>;
export type UserLearningEnrollment = typeof userLearningEnrollments.$inferSelect;
