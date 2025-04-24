import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertUserSchema,
  insertBusinessProfileSchema,
  insertBrandingInfoSchema,
  insertSocialMediaPlanSchema,
  insertSubscriptionSchema,
  insertConstellationSchema,
  insertLearningPathSchema,
  insertLearningPathStepSchema,
  insertUserLearningEnrollmentSchema,
  insertUserLearningProgressSchema
} from "@shared/schema";
import { setupAuth, requireAuth } from "./auth";
import { registerGovernanceRoutes } from "./governance-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Map legacy routes to the new auth routes for backward compatibility
  app.post("/api/users/register", (req, res, next) => {
    req.url = "/api/register";
    next();
  });
  
  app.post("/api/users/login", (req, res, next) => {
    req.url = "/api/login";
    next();
  });
  
  app.post("/api/users/logout", (req, res, next) => {
    req.url = "/api/logout";
    next();
  });
  
  app.get("/api/users/me", (req, res, next) => {
    req.url = "/api/user";
    next();
  });

  // Business profile routes
  app.post("/api/business-profiles", requireAuth, async (req, res) => {
    try {
      const profileInput = {
        ...req.body,
        userId: req.user.id
      };
      
      const validatedInput = insertBusinessProfileSchema.parse(profileInput);
      const profile = await storage.createBusinessProfile(validatedInput);
      
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating business profile" });
    }
  });
  
  app.get("/api/business-profiles/me", requireAuth, async (req, res) => {
    try {
      const profile = await storage.getBusinessProfileByUserId(req.user.id);
      
      if (!profile) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Error fetching business profile" });
    }
  });
  
  app.put("/api/business-profiles/:id", requireAuth, async (req, res) => {
    try {
      const profileId = parseInt(req.params.id);
      const profile = await storage.getBusinessProfile(profileId);
      
      if (!profile) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      
      if (profile.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this profile" });
      }
      
      const updatedProfile = await storage.updateBusinessProfile(profileId, req.body);
      
      res.json(updatedProfile);
    } catch (error) {
      res.status(500).json({ message: "Error updating business profile" });
    }
  });

  // Branding routes
  app.post("/api/branding", requireAuth, async (req, res) => {
    try {
      const businessProfile = await storage.getBusinessProfileByUserId(req.user.id);
      
      if (!businessProfile) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      
      const brandingInput = {
        ...req.body,
        businessId: businessProfile.id
      };
      
      const validatedInput = insertBrandingInfoSchema.parse(brandingInput);
      const branding = await storage.createBrandingInfo(validatedInput);
      
      res.status(201).json(branding);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating branding info" });
    }
  });
  
  app.get("/api/branding/me", requireAuth, async (req, res) => {
    try {
      const businessProfile = await storage.getBusinessProfileByUserId(req.session.userId!);
      
      if (!businessProfile) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      
      const branding = await storage.getBrandingInfoByBusinessId(businessProfile.id);
      
      if (!branding) {
        return res.status(404).json({ message: "Branding info not found" });
      }
      
      res.json(branding);
    } catch (error) {
      res.status(500).json({ message: "Error fetching branding info" });
    }
  });
  
  app.put("/api/branding/:id", requireAuth, async (req, res) => {
    try {
      const brandingId = parseInt(req.params.id);
      const branding = await storage.getBrandingInfo(brandingId);
      
      if (!branding) {
        return res.status(404).json({ message: "Branding info not found" });
      }
      
      const businessProfile = await storage.getBusinessProfile(branding.businessId);
      
      if (!businessProfile || businessProfile.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to update this branding info" });
      }
      
      const updatedBranding = await storage.updateBrandingInfo(brandingId, req.body);
      
      res.json(updatedBranding);
    } catch (error) {
      res.status(500).json({ message: "Error updating branding info" });
    }
  });

  // Social media routes
  app.post("/api/social-media-plans", requireAuth, async (req, res) => {
    try {
      const businessProfile = await storage.getBusinessProfileByUserId(req.session.userId!);
      
      if (!businessProfile) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      
      const planInput = {
        ...req.body,
        businessId: businessProfile.id
      };
      
      const validatedInput = insertSocialMediaPlanSchema.parse(planInput);
      const plan = await storage.createSocialMediaPlan(validatedInput);
      
      res.status(201).json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating social media plan" });
    }
  });
  
  app.get("/api/social-media-plans/me", requireAuth, async (req, res) => {
    try {
      const businessProfile = await storage.getBusinessProfileByUserId(req.session.userId!);
      
      if (!businessProfile) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      
      const plan = await storage.getSocialMediaPlanByBusinessId(businessProfile.id);
      
      if (!plan) {
        return res.status(404).json({ message: "Social media plan not found" });
      }
      
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Error fetching social media plan" });
    }
  });
  
  app.put("/api/social-media-plans/:id", requireAuth, async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      const plan = await storage.getSocialMediaPlan(planId);
      
      if (!plan) {
        return res.status(404).json({ message: "Social media plan not found" });
      }
      
      const businessProfile = await storage.getBusinessProfile(plan.businessId);
      
      if (!businessProfile || businessProfile.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to update this social media plan" });
      }
      
      const updatedPlan = await storage.updateSocialMediaPlan(planId, req.body);
      
      res.json(updatedPlan);
    } catch (error) {
      res.status(500).json({ message: "Error updating social media plan" });
    }
  });

  // Subscription routes
  app.post("/api/subscriptions", requireAuth, async (req, res) => {
    try {
      const businessProfile = await storage.getBusinessProfileByUserId(req.session.userId!);
      
      if (!businessProfile) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      
      const subscriptionInput = {
        ...req.body,
        businessId: businessProfile.id
      };
      
      const validatedInput = insertSubscriptionSchema.parse(subscriptionInput);
      const subscription = await storage.createSubscription(validatedInput);
      
      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating subscription" });
    }
  });
  
  app.get("/api/subscriptions/me", requireAuth, async (req, res) => {
    try {
      const businessProfile = await storage.getBusinessProfileByUserId(req.session.userId!);
      
      if (!businessProfile) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      
      const subscription = await storage.getSubscriptionByBusinessId(businessProfile.id);
      
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ message: "Error fetching subscription" });
    }
  });
  
  app.put("/api/subscriptions/:id", requireAuth, async (req, res) => {
    try {
      const subscriptionId = parseInt(req.params.id);
      const subscription = await storage.getSubscription(subscriptionId);
      
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      const businessProfile = await storage.getBusinessProfile(subscription.businessId);
      
      if (!businessProfile || businessProfile.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to update this subscription" });
      }
      
      const updatedSubscription = await storage.updateSubscription(subscriptionId, req.body);
      
      res.json(updatedSubscription);
    } catch (error) {
      res.status(500).json({ message: "Error updating subscription" });
    }
  });

  // Constellation routes
  app.get("/api/constellations", async (req, res) => {
    try {
      const constellations = await storage.getAllConstellations();
      res.json(constellations);
    } catch (error) {
      console.error("Error fetching constellations:", error);
      res.status(500).json({ message: "Error fetching constellations" });
    }
  });

  app.get("/api/constellations/region/:region", async (req, res) => {
    try {
      const constellation = await storage.getConstellationByRegion(req.params.region);
      if (!constellation) {
        return res.status(404).json({ message: "Constellation not found for region" });
      }
      res.json(constellation);
    } catch (error) {
      console.error("Error fetching constellation by region:", error);
      res.status(500).json({ message: "Error fetching constellation by region" });
    }
  });

  app.get("/api/constellations/:id", async (req, res) => {
    try {
      const constellation = await storage.getConstellation(parseInt(req.params.id));
      if (!constellation) {
        return res.status(404).json({ message: "Constellation not found" });
      }
      res.json(constellation);
    } catch (error) {
      console.error("Error fetching constellation:", error);
      res.status(500).json({ message: "Error fetching constellation" });
    }
  });

  // Temporarily removing auth requirement for testing
  app.post("/api/constellations", async (req, res) => {
    try {
      const insertData = insertConstellationSchema.parse(req.body);
      const constellation = await storage.createConstellation(insertData);
      res.status(201).json(constellation);
    } catch (error) {
      console.error("Error creating constellation:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(400).json({ message: "Error creating constellation" });
    }
  });

  app.patch("/api/constellations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const constellation = await storage.getConstellation(id);
      
      if (!constellation) {
        return res.status(404).json({ message: "Constellation not found" });
      }
      
      const updatedConstellation = await storage.updateConstellation(id, req.body);
      res.json(updatedConstellation);
    } catch (error) {
      console.error("Error updating constellation:", error);
      res.status(400).json({ message: "Error updating constellation" });
    }
  });

  // User routes for constellation visualization
  app.get("/api/users/region/:region", async (req, res) => {
    try {
      const { region } = req.params;
      const users = await storage.getUsersByRegion(region);
      
      if (!users || users.length === 0) {
        return res.status(404).json({ message: "No users found in this region" });
      }
      
      // Return only necessary information for constellation visualization
      const constellationUsers = users.map(user => ({
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        starName: user.starName,
        starColor: user.starColor,
        starSize: user.starSize,
        starPosition: user.starPosition,
        role: user.role,
        region: user.region
      }));
      
      res.json(constellationUsers);
    } catch (error) {
      console.error("Error fetching users by region:", error);
      res.status(500).json({ message: "Failed to fetch users by region" });
    }
  });

  // Resource routes
  app.get("/api/resources", async (req, res) => {
    try {
      let tier = undefined;
      
      if (req.session.userId) {
        const businessProfile = await storage.getBusinessProfileByUserId(req.session.userId);
        
        if (businessProfile) {
          const subscription = await storage.getSubscriptionByBusinessId(businessProfile.id);
          if (subscription && subscription.isActive) {
            tier = subscription.tier;
          }
        }
      }
      
      const category = req.query.category as string | undefined;
      
      let resources;
      if (category) {
        resources = await storage.getResourcesByCategory(category, tier);
      } else {
        resources = await storage.getAllResources(tier);
      }
      
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Error fetching resources" });
    }
  });
  
  app.get("/api/resources/:id", async (req, res) => {
    try {
      const resourceId = parseInt(req.params.id);
      const resource = await storage.getResource(resourceId);
      
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      // Check if resource is public or user has access
      if (!resource.isPublic) {
        let hasAccess = false;
        
        if (req.session.userId) {
          const businessProfile = await storage.getBusinessProfileByUserId(req.session.userId);
          
          if (businessProfile) {
            const subscription = await storage.getSubscriptionByBusinessId(businessProfile.id);
            
            if (subscription && subscription.isActive) {
              if (subscription.tier === 'premium') {
                hasAccess = true;
              } else if (subscription.tier === 'growth' && resource.requiredTier !== 'premium') {
                hasAccess = true;
              } else if (subscription.tier === 'self-guided' && resource.requiredTier === 'self-guided') {
                hasAccess = true;
              }
            }
          }
        }
        
        if (!hasAccess) {
          return res.status(403).json({ message: "Access denied to this resource" });
        }
      }
      
      res.json(resource);
    } catch (error) {
      res.status(500).json({ message: "Error fetching resource" });
    }
  });

  // Register governance routes (areas, forums, etc.)
  registerGovernanceRoutes(app);

  // Learning Paths routes
  // Get all learning paths (optionally filtered by category)
  app.get("/api/learning-paths", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const paths = await storage.getAllLearningPaths(category);
      res.json(paths);
    } catch (error) {
      console.error("Error fetching learning paths:", error);
      res.status(500).json({ message: "Error fetching learning paths" });
    }
  });

  // Get a specific learning path by ID
  app.get("/api/learning-paths/:id", async (req, res) => {
    try {
      const pathId = parseInt(req.params.id);
      const path = await storage.getLearningPath(pathId);
      
      if (!path) {
        return res.status(404).json({ message: "Learning path not found" });
      }
      
      // Get steps for this path
      const steps = await storage.getLearningPathSteps(pathId);
      
      res.json({ ...path, steps });
    } catch (error) {
      console.error("Error fetching learning path:", error);
      res.status(500).json({ message: "Error fetching learning path" });
    }
  });

  // Create a new learning path
  app.post("/api/learning-paths", requireAuth, async (req, res) => {
    try {
      const pathInput = insertLearningPathSchema.parse(req.body);
      const path = await storage.createLearningPath(pathInput);
      res.status(201).json(path);
    } catch (error) {
      console.error("Error creating learning path:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating learning path" });
    }
  });

  // Update a learning path
  app.put("/api/learning-paths/:id", requireAuth, async (req, res) => {
    try {
      const pathId = parseInt(req.params.id);
      const path = await storage.getLearningPath(pathId);
      
      if (!path) {
        return res.status(404).json({ message: "Learning path not found" });
      }
      
      // Check if user is authorized (e.g., is the author)
      if (path.authorId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to update this learning path" });
      }
      
      const updatedPath = await storage.updateLearningPath(pathId, req.body);
      res.json(updatedPath);
    } catch (error) {
      console.error("Error updating learning path:", error);
      res.status(500).json({ message: "Error updating learning path" });
    }
  });

  // Learning Path Steps routes
  // Get steps for a learning path
  app.get("/api/learning-paths/:pathId/steps", async (req, res) => {
    try {
      const pathId = parseInt(req.params.pathId);
      const steps = await storage.getLearningPathSteps(pathId);
      res.json(steps);
    } catch (error) {
      console.error("Error fetching learning path steps:", error);
      res.status(500).json({ message: "Error fetching learning path steps" });
    }
  });

  // Add a step to a learning path
  app.post("/api/learning-paths/:pathId/steps", requireAuth, async (req, res) => {
    try {
      const pathId = parseInt(req.params.pathId);
      const path = await storage.getLearningPath(pathId);
      
      if (!path) {
        return res.status(404).json({ message: "Learning path not found" });
      }
      
      // Check if user is authorized (e.g., is the author)
      if (path.authorId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to add steps to this learning path" });
      }
      
      const stepInput = {
        ...req.body,
        pathId
      };
      
      const validatedInput = insertLearningPathStepSchema.parse(stepInput);
      const step = await storage.createLearningPathStep(validatedInput);
      
      res.status(201).json(step);
    } catch (error) {
      console.error("Error creating learning path step:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating learning path step" });
    }
  });

  // Update a learning path step
  app.put("/api/learning-path-steps/:id", requireAuth, async (req, res) => {
    try {
      const stepId = parseInt(req.params.id);
      const step = await storage.getLearningPathStep(stepId);
      
      if (!step) {
        return res.status(404).json({ message: "Learning path step not found" });
      }
      
      // Check if user is authorized
      const path = await storage.getLearningPath(step.pathId);
      if (!path || path.authorId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to update this step" });
      }
      
      const updatedStep = await storage.updateLearningPathStep(stepId, req.body);
      res.json(updatedStep);
    } catch (error) {
      console.error("Error updating learning path step:", error);
      res.status(500).json({ message: "Error updating learning path step" });
    }
  });

  // Delete a learning path step
  app.delete("/api/learning-path-steps/:id", requireAuth, async (req, res) => {
    try {
      const stepId = parseInt(req.params.id);
      const step = await storage.getLearningPathStep(stepId);
      
      if (!step) {
        return res.status(404).json({ message: "Learning path step not found" });
      }
      
      // Check if user is authorized
      const path = await storage.getLearningPath(step.pathId);
      if (!path || path.authorId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to delete this step" });
      }
      
      await storage.deleteLearningPathStep(stepId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting learning path step:", error);
      res.status(500).json({ message: "Error deleting learning path step" });
    }
  });

  // User Learning Enrollment routes
  // Get user's enrollments
  app.get("/api/user/enrollments", requireAuth, async (req, res) => {
    try {
      const enrollments = await storage.getUserLearningEnrollments(req.session.userId!);
      
      // For each enrollment, get the associated learning path
      const enrichedEnrollments = await Promise.all(
        enrollments.map(async (enrollment) => {
          const path = await storage.getLearningPath(enrollment.pathId);
          return {
            ...enrollment,
            path
          };
        })
      );
      
      res.json(enrichedEnrollments);
    } catch (error) {
      console.error("Error fetching user enrollments:", error);
      res.status(500).json({ message: "Error fetching user enrollments" });
    }
  });

  // Enroll in a learning path
  app.post("/api/learning-paths/:pathId/enroll", requireAuth, async (req, res) => {
    try {
      const pathId = parseInt(req.params.pathId);
      const path = await storage.getLearningPath(pathId);
      
      if (!path) {
        return res.status(404).json({ message: "Learning path not found" });
      }
      
      // Check if user is already enrolled
      const existingEnrollment = await storage.getUserEnrollmentByPathId(req.session.userId!, pathId);
      if (existingEnrollment) {
        return res.status(400).json({ message: "You are already enrolled in this learning path" });
      }
      
      const enrollmentInput = {
        userId: req.session.userId!,
        pathId,
        isActive: true
      };
      
      const enrollment = await storage.createUserLearningEnrollment(enrollmentInput);
      res.status(201).json(enrollment);
    } catch (error) {
      console.error("Error enrolling in learning path:", error);
      res.status(500).json({ message: "Error enrolling in learning path" });
    }
  });

  // Update enrollment (e.g., mark as inactive)
  app.put("/api/enrollments/:id", requireAuth, async (req, res) => {
    try {
      const enrollmentId = parseInt(req.params.id);
      const enrollment = await storage.getUserLearningEnrollment(enrollmentId);
      
      if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
      }
      
      if (enrollment.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to update this enrollment" });
      }
      
      const updatedEnrollment = await storage.updateUserLearningEnrollment(enrollmentId, req.body);
      res.json(updatedEnrollment);
    } catch (error) {
      console.error("Error updating enrollment:", error);
      res.status(500).json({ message: "Error updating enrollment" });
    }
  });

  // User Learning Progress routes
  // Get user's progress for a learning path
  app.get("/api/learning-paths/:pathId/progress", requireAuth, async (req, res) => {
    try {
      const pathId = parseInt(req.params.pathId);
      const progress = await storage.getUserLearningProgress(req.session.userId!, pathId);
      
      // Get all steps to calculate overall progress
      const steps = await storage.getLearningPathSteps(pathId);
      const totalSteps = steps.length;
      const completedSteps = progress.filter(p => p.completedAt).length;
      
      const overallProgress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
      
      res.json({
        progress,
        overallProgress,
        totalSteps,
        completedSteps
      });
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ message: "Error fetching user progress" });
    }
  });

  // Update progress for a step (e.g., mark as completed)
  app.post("/api/learning-path-steps/:stepId/progress", requireAuth, async (req, res) => {
    try {
      const stepId = parseInt(req.params.stepId);
      const step = await storage.getLearningPathStep(stepId);
      
      if (!step) {
        return res.status(404).json({ message: "Learning path step not found" });
      }
      
      // Check if user is enrolled in this path
      const enrollment = await storage.getUserEnrollmentByPathId(req.session.userId!, step.pathId);
      if (!enrollment) {
        return res.status(400).json({ message: "You are not enrolled in this learning path" });
      }
      
      // Check if progress already exists
      let progress = await storage.getUserProgressForStep(req.session.userId!, stepId);
      
      if (progress) {
        // Update existing progress
        progress = await storage.updateUserLearningProgress(progress.id, {
          ...req.body,
          completedAt: req.body.completed ? new Date() : null
        });
      } else {
        // Create new progress
        progress = await storage.createUserLearningProgress({
          userId: req.session.userId!,
          pathId: step.pathId,
          stepId,
          notes: req.body.notes || null,
          completedAt: req.body.completed ? new Date() : null,
          resourceRating: req.body.resourceRating || null
        });
      }
      
      res.json(progress);
    } catch (error) {
      console.error("Error updating step progress:", error);
      res.status(500).json({ message: "Error updating step progress" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
