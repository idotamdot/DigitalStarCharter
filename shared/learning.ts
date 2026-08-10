import { z } from "zod";

export const learningTierSchema = z.enum(["self-guided", "growth", "premium"]);
export type LearningTier = z.infer<typeof learningTierSchema>;

export const learningSkillLevelSchema = z.enum(["beginner", "intermediate", "advanced"]);
export type LearningSkillLevel = z.infer<typeof learningSkillLevelSchema>;

export interface LearningPath {
  id: number;
  title: string;
  description: string;
  category: string;
  skillLevel: LearningSkillLevel;
  estimatedHours: number;
  thumbnailUrl: string | null;
  tags: string[];
  authorId: number;
  requiredTier: LearningTier;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertLearningPath {
  title: string;
  description: string;
  category: string;
  skillLevel: LearningSkillLevel;
  estimatedHours: number;
  thumbnailUrl?: string | null;
  tags?: string[];
  authorId: number;
  requiredTier: LearningTier;
}

export const insertLearningPathSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  skillLevel: learningSkillLevelSchema,
  estimatedHours: z.number().int().positive(),
  thumbnailUrl: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  authorId: z.number().int().positive(),
  requiredTier: learningTierSchema,
});

export interface LearningPathStep {
  id: number;
  pathId: number;
  resourceId: number;
  stepOrder: number;
  title: string;
  description: string | null;
  estimatedMinutes: number;
  isRequired: boolean;
}

export interface InsertLearningPathStep {
  pathId: number;
  resourceId: number;
  stepOrder: number;
  title: string;
  description?: string | null;
  estimatedMinutes: number;
  isRequired?: boolean;
}

export const insertLearningPathStepSchema = z.object({
  pathId: z.number().int().positive(),
  resourceId: z.number().int().positive(),
  stepOrder: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  estimatedMinutes: z.number().int().positive(),
  isRequired: z.boolean().optional(),
});

export interface UserLearningEnrollment {
  id: number;
  userId: number;
  pathId: number;
  enrolledAt: Date;
  completedAt: Date | null;
  isActive: boolean;
  progressPercent: number;
  lastAccessedAt: Date;
}

export interface InsertUserLearningEnrollment {
  userId: number;
  pathId: number;
  isActive?: boolean;
  completedAt?: Date | null;
}

export const insertUserLearningEnrollmentSchema = z.object({
  userId: z.number().int().positive(),
  pathId: z.number().int().positive(),
  isActive: z.boolean().optional(),
  completedAt: z.date().nullable().optional(),
});

export interface UserLearningProgress {
  id: number;
  userId: number;
  pathId: number;
  stepId: number;
  startedAt: Date;
  completedAt: Date | null;
  notes: string | null;
  resourceRating: number | null;
}

export interface InsertUserLearningProgress {
  userId: number;
  pathId: number;
  stepId: number;
  completedAt?: Date | null;
  notes?: string | null;
  resourceRating?: number | null;
}

export const insertUserLearningProgressSchema = z.object({
  userId: z.number().int().positive(),
  pathId: z.number().int().positive(),
  stepId: z.number().int().positive(),
  completedAt: z.date().nullable().optional(),
  notes: z.string().nullable().optional(),
  resourceRating: z.number().int().min(1).max(5).nullable().optional(),
});

export interface LearningPathApi {
  id: number;
  title: string;
  description: string;
  category: string;
  skillLevel: LearningSkillLevel;
  estimatedHours: number;
  thumbnailUrl: string | null;
  tags: string[];
  authorId: number;
  requiredTier: LearningTier;
  createdAt: string;
  updatedAt: string;
}

export interface LearningPathStepApi {
  id: number;
  pathId: number;
  resourceId: number;
  stepOrder: number;
  title: string;
  description: string | null;
  estimatedMinutes: number;
  isRequired: boolean;
  completedAt?: string | null;
  resourceRating?: number | null;
}

export interface LearningPathDetailApi extends LearningPathApi {
  steps: LearningPathStepApi[];
}

export interface LearningEnrollmentApi {
  id: number;
  userId: number;
  pathId: number;
  enrolledAt: string;
  completedAt: string | null;
  isActive: boolean;
  progressPercent: number;
  lastAccessedAt: string;
  path: LearningPathApi | null;
}

export interface LearningProgressApi {
  progress: Array<{
    id: number;
    userId: number;
    pathId: number;
    stepId: number;
    startedAt: string;
    completedAt: string | null;
    notes: string | null;
    resourceRating: number | null;
  }>;
  overallProgress: number;
  totalSteps: number;
  completedSteps: number;
}

export interface ApiMessage {
  message: string;
}
