import type { Express } from "express";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertAreaSchema,
  insertForumTopicSchema,
  insertForumReplySchema,
  insertUserSchema
} from "@shared/schema";
import { requireAuth } from "./auth";
import {
  GOVERNANCE_ROLES,
  ONBOARDING_STEPS,
  getRoleById,
  canUserVote
} from "@shared/governance";

// Onboarding application schema
const onboardingApplicationSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  primaryRole: z.string(),
  yearsExperience: z.string(),
  skills: z.string().min(10),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  additionalInfo: z.string().optional(),
  region: z.string(),
  governanceUnderstanding: z.boolean(),
  characterEvaluationConsent: z.boolean(),
});

export function registerGovernanceRoutes(app: Express) {
  
  // ============================================================================
  // ONBOARDING ROUTES
  // ============================================================================
  
  // Get onboarding steps for a role
  app.get("/api/onboarding/steps/:roleId?", (req, res) => {
    try {
      const roleId = req.params.roleId || "member";
      const steps = ONBOARDING_STEPS.filter(step => 
        step.requiredFor.includes('all') || step.requiredFor.includes(roleId)
      ).sort((a, b) => a.order - b.order);
      
      res.json(steps);
    } catch (error) {
      res.status(500).json({ message: "Error fetching onboarding steps" });
    }
  });

  // Submit onboarding application
  app.post("/api/onboarding/apply", async (req, res) => {
    try {
      const applicationData = onboardingApplicationSchema.parse(req.body);
      
      // Create a user application record (this would typically go to a separate applications table)
      const user = await storage.createUser({
        username: applicationData.email, // Use email as username for now
        password: "temp-password", // This would be handled differently in production
        email: applicationData.email,
        fullName: applicationData.fullName,
        region: applicationData.region,
        role: applicationData.primaryRole,
        businessType: applicationData.primaryRole,
        starName: `${applicationData.fullName.replace(/\s+/g, "-")}-star`,
        isGuidingStar: false,
        isAreaLeader: false,
        isVoter: false,
        characterEvaluation: `Applied on ${new Date().toISOString()} for role: ${applicationData.primaryRole}. Skills: ${applicationData.skills.substring(0, 100)}...`,
      });

      res.status(201).json({
        message: "Application submitted successfully",
        applicationId: user.id,
        nextSteps: [
          "You will receive an email confirmation within 24 hours",
          "Technical assessment will be scheduled within 3-5 days",
          "Character evaluation with area leader and peers",
          "Final decision communicated within 1-2 weeks"
        ]
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid application data", errors: error.errors });
      }
      console.error("Application submission error:", error);
      res.status(500).json({ message: "Error processing application" });
    }
  });

  // Get governance roles
  app.get("/api/governance/roles", (req, res) => {
    res.json(GOVERNANCE_ROLES);
  });

  // Get specific role information
  app.get("/api/governance/roles/:roleId", (req, res) => {
    const role = getRoleById(req.params.roleId);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    res.json(role);
  });

  // ============================================================================
  // AREA MANAGEMENT ROUTES
  // ============================================================================
  
  // Get all areas for a constellation
  app.get("/api/areas", async (req, res) => {
    try {
      // In a real implementation, this would filter by user's constellation
      const areas = await storage.getAllAreas?.() || [];
      res.json(areas);
    } catch (error) {
      res.status(500).json({ message: "Error fetching areas" });
    }
  });

  // Get specific area
  app.get("/api/areas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const area = await storage.getArea(id);
      if (!area) {
        return res.status(404).json({ message: "Area not found" });
      }
      res.json(area);
    } catch (error) {
      res.status(500).json({ message: "Error fetching area" });
    }
  });
  
  app.get("/api/constellations/:id/areas", async (req, res) => {
    try {
      const constellationId = parseInt(req.params.id);
      const areas = await storage.getAreasByConstellation(constellationId);
      res.json(areas);
    } catch (error) {
      res.status(500).json({ message: "Error fetching areas for constellation" });
    }
  });
  
  
  // Create new area (Guiding Stars only)
  app.post("/api/areas", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      if (!user.isGuidingStar) {
        return res.status(403).json({ message: "Only Guiding Stars can create areas" });
      }
      
      const areaData = insertAreaSchema.parse(req.body);
      const area = await storage.createArea(areaData);
      res.status(201).json(area);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating area" });
    }
  });
  
  // Update area (Area Leaders and Guiding Stars)
  app.patch("/api/areas/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = req.user;
      
      const area = await storage.getArea(id);
      if (!area) {
        return res.status(404).json({ message: "Area not found" });
      }
      
      // Check permissions: must be area leader or guiding star
      if (!user.isGuidingStar && area.leaderId !== user.id) {
        return res.status(403).json({ message: "Insufficient permissions to update this area" });
      }
      
      const updatedArea = await storage.updateArea(id, req.body);
      res.json(updatedArea);
    } catch (error) {
      res.status(500).json({ message: "Error updating area" });
    }
  });

  // ============================================================================
  // VOTING SYSTEM ROUTES
  // ============================================================================
  
  // Get active votes for user
  app.get("/api/votes/active", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      
      if (!canUserVote(user.role || "member")) {
        return res.status(403).json({ message: "User does not have voting rights" });
      }
      
      // This would fetch votes where user is in the voting pool
      const votes = []; // Placeholder - implement actual vote fetching
      res.json(votes);
    } catch (error) {
      res.status(500).json({ message: "Error fetching active votes" });
    }
  });

  // Cast a vote
  app.post("/api/votes/:voteId/cast", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      const voteId = parseInt(req.params.voteId);
      const { vote, reason } = req.body;
      
      if (!canUserVote(user.role || "member")) {
        return res.status(403).json({ message: "User does not have voting rights" });
      }
      
      // Validate vote (true/false for yes/no, or abstain)
      if (typeof vote !== 'boolean' && vote !== 'abstain') {
        return res.status(400).json({ message: "Vote must be true, false, or 'abstain'" });
      }
      
      // This would implement actual vote casting logic
      res.json({ message: "Vote cast successfully", voteId, userVote: vote });
    } catch (error) {
      res.status(500).json({ message: "Error casting vote" });
    }
  });

  // ============================================================================
  // GUIDING STAR FORUM ROUTES
  // ============================================================================
  
  // Get forum topics (Guiding Stars only)
  app.get("/api/forum/topics", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      if (!user.isGuidingStar) {
        return res.status(403).json({ message: "Only Guiding Stars can access the forum" });
      }
      
      const topics = await storage.getAllForumTopics();
      res.json(topics);
    } catch (error) {
      res.status(500).json({ message: "Error fetching forum topics" });
    }
  });

  // Get specific forum topic
  app.get("/api/forum/topics/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      if (!user.isGuidingStar) {
        return res.status(403).json({ message: "Only Guiding Stars can access forum topics" });
      }
      
      const id = parseInt(req.params.id);
      const topic = await storage.getForumTopic(id);
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      
      res.json(topic);
    } catch (error) {
      res.status(500).json({ message: "Error fetching forum topic" });
    }
  });

  // Create forum topic (Guiding Stars only)
  app.post("/api/forum/topics", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      if (!user.isGuidingStar) {
        return res.status(403).json({ message: "Only Guiding Stars can create forum topics" });
      }
      
      const topicData = insertForumTopicSchema.parse({
        ...req.body,
        createdBy: user.id
      });
      
      const topic = await storage.createForumTopic(topicData);
      res.status(201).json(topic);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating forum topic" });
    }
  });

  // Get forum replies
  app.get("/api/forum/topics/:id/replies", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      if (!user.isGuidingStar) {
        return res.status(403).json({ message: "Only Guiding Stars can view forum replies" });
      }
      
      const topicId = parseInt(req.params.id);
      const topic = await storage.getForumTopic(topicId);
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      
      const replies = await storage.getForumRepliesByTopic(topicId);
      res.json(replies);
    } catch (error) {
      res.status(500).json({ message: "Error fetching forum replies" });
    }
  });

  // Create forum reply (Guiding Stars only)
  app.post("/api/forum/replies", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      if (!user.isGuidingStar) {
        return res.status(403).json({ message: "Only Guiding Stars can reply to forum topics" });
      }
      
      const replyData = insertForumReplySchema.parse({
        ...req.body,
        createdBy: user.id
      });
      
      const topic = await storage.getForumTopic(replyData.topicId);
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      
      const reply = await storage.createForumReply(replyData);
      res.status(201).json(reply);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating forum reply" });
    }
  });

  // ============================================================================
  // MEMBER MANAGEMENT ROUTES
  // ============================================================================
  
  // Get members in user's area (Area Leaders and above)
  app.get("/api/governance/members/area", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      
      if (!user.isAreaLeader && !user.isGuidingStar) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      // This would fetch members in the user's area
      const members = []; // Placeholder
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Error fetching area members" });
    }
  });

  // Approve member application (Area Leaders and above)
  app.post("/api/governance/members/:memberId/approve", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      const memberId = parseInt(req.params.memberId);
      
      if (!user.isAreaLeader && !user.isGuidingStar) {
        return res.status(403).json({ message: "Only area leaders and guiding stars can approve members" });
      }
      
      // This would implement the member approval logic
      res.json({ message: "Member approved successfully", memberId });
    } catch (error) {
      res.status(500).json({ message: "Error approving member" });
    }
  });

  // Conduct character evaluation (Area Leaders and above)
  app.post("/api/governance/members/:memberId/evaluate", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      const memberId = parseInt(req.params.memberId);
      const { evaluation, recommendation } = req.body;
      
      if (!user.isAreaLeader && !user.isGuidingStar) {
        return res.status(403).json({ message: "Only area leaders and guiding stars can conduct evaluations" });
      }
      
      // This would implement the character evaluation logic
      res.json({ 
        message: "Character evaluation completed", 
        memberId, 
        evaluatedBy: user.id,
        recommendation 
      });
    } catch (error) {
      res.status(500).json({ message: "Error conducting character evaluation" });
    }
  });
}