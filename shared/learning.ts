import { z } from "zod";

export const learningTierSchema = z.enum(["open", "member", "steward"]);
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
  authorMemberId: number;
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
  authorMemberId: number;
  requiredTier: LearningTier;
}

export const insertLearningPathSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  category: z.string().trim().min(1),
  skillLevel: learningSkillLevelSchema,
  estimatedHours: z.number().int().positive(),
  thumbnailUrl: z.string().nullable().optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  authorMemberId: z.number().int().positive(),
  requiredTier: learningTierSchema,
});

export interface LearningPathStep {
  id: number;
  pathId: number;
  resourceId: number | null;
  stepOrder: number;
  title: string;
  description: string | null;
  estimatedMinutes: number;
  isRequired: boolean;
}

export interface InsertLearningPathStep {
  pathId: number;
  resourceId?: number | null;
  stepOrder: number;
  title: string;
  description?: string | null;
  estimatedMinutes: number;
  isRequired?: boolean;
}

export const insertLearningPathStepSchema = z.object({
  pathId: z.number().int().positive(),
  resourceId: z.number().int().positive().nullable().optional(),
  stepOrder: z.number().int().positive(),
  title: z.string().trim().min(1),
  description: z.string().nullable().optional(),
  estimatedMinutes: z.number().int().positive(),
  isRequired: z.boolean().optional(),
});

export interface LearningEnrollment {
  id: number;
  memberId: number;
  pathId: number;
  enrolledAt: Date;
  completedAt: Date | null;
  isActive: boolean;
  progressPercent: number;
  lastAccessedAt: Date;
}

export interface InsertLearningEnrollment {
  memberId: number;
  pathId: number;
  isActive?: boolean;
  completedAt?: Date | null;
}

export const insertLearningEnrollmentSchema = z.object({
  memberId: z.number().int().positive(),
  pathId: z.number().int().positive(),
  isActive: z.boolean().optional(),
  completedAt: z.date().nullable().optional(),
});

export interface LearningProgress {
  id: number;
  memberId: number;
  pathId: number;
  stepId: number;
  startedAt: Date;
  completedAt: Date | null;
  notes: string | null;
  resourceRating: number | null;
}

export interface InsertLearningProgress {
  memberId: number;
  pathId: number;
  stepId: number;
  completedAt?: Date | null;
  notes?: string | null;
  resourceRating?: number | null;
}

export const insertLearningProgressSchema = z.object({
  memberId: z.number().int().positive(),
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
  authorMemberId: number;
  requiredTier: LearningTier;
  createdAt: string;
  updatedAt: string;
}

export interface LearningPathStepApi {
  id: number;
  pathId: number;
  resourceId: number | null;
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
  memberId: number;
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
    memberId: number;
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
