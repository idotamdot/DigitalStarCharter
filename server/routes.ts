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
  insertAreaSchema,
  insertForumTopicSchema,
  insertForumReplySchema
} from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session store
  const SessionStore = MemoryStore(session);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "digital-presence-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 86400000 }, // 1 day
      store: new SessionStore({ checkPeriod: 86400000 })
    })
  );

  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // User routes
  app.post("/api/users/register", async (req, res) => {
    try {
      const userInput = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingByUsername = await storage.getUserByUsername(userInput.username);
      if (existingByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingByEmail = await storage.getUserByEmail(userInput.email);
      if (existingByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      const user = await storage.createUser(userInput);
      
      // Remove password before sending response
      const { password, ...userWithoutPassword } = user;
      
      // Set session
      req.session.userId = user.id;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating user" });
    }
  });
  
  app.post("/api/users/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set session
      req.session.userId = user.id;
      
      // Remove password before sending response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error logging in" });
    }
  });
  
  app.post("/api/users/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/users/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password before sending response
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user" });
    }
  });

  // Business profile routes
  app.post("/api/business-profiles", requireAuth, async (req, res) => {
    try {
      const profileInput = {
        ...req.body,
        userId: req.session.userId
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
      const profile = await storage.getBusinessProfileByUserId(req.session.userId!);
      
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
      
      if (profile.userId !== req.session.userId) {
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
      const businessProfile = await storage.getBusinessProfileByUserId(req.session.userId!);
      
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

  const httpServer = createServer(app);
  return httpServer;
}
