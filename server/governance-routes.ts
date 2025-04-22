import type { Express } from "express";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertAreaSchema,
  insertForumTopicSchema,
  insertForumReplySchema
} from "@shared/schema";

export function registerGovernanceRoutes(app: Express) {
  // Area Management Routes
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
  
  // Temporarily removing auth for testing
  app.post("/api/areas", async (req, res) => {
    try {
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
  
  app.patch("/api/areas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const area = await storage.getArea(id);
      if (!area) {
        return res.status(404).json({ message: "Area not found" });
      }
      
      // In a real app, check if user is a Guiding Star or has permission
      // const user = await storage.getUser(req.session.userId!);
      // if (!user.isGuidingStar) {
      //   return res.status(403).json({ message: "Only Guiding Stars can update areas" });
      // }
      
      const updatedArea = await storage.updateArea(id, req.body);
      res.json(updatedArea);
    } catch (error) {
      res.status(500).json({ message: "Error updating area" });
    }
  });
  
  // Guiding Star Forum Routes
  app.get("/api/forum/topics", async (req, res) => {
    try {
      // In a real app, check if user is a Guiding Star
      // const user = await storage.getUser(req.session.userId!);
      // if (!user.isGuidingStar) {
      //   return res.status(403).json({ message: "Only Guiding Stars can access the forum" });
      // }
      
      const topics = await storage.getAllForumTopics();
      res.json(topics);
    } catch (error) {
      res.status(500).json({ message: "Error fetching forum topics" });
    }
  });
  
  app.get("/api/forum/topics/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const topic = await storage.getForumTopic(id);
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      
      // In a real app, check if user is a Guiding Star
      // const user = await storage.getUser(req.session.userId!);
      // if (!user.isGuidingStar) {
      //   return res.status(403).json({ message: "Only Guiding Stars can access forum topics" });
      // }
      
      res.json(topic);
    } catch (error) {
      res.status(500).json({ message: "Error fetching forum topic" });
    }
  });
  
  app.post("/api/forum/topics", async (req, res) => {
    try {
      const topicData = insertForumTopicSchema.parse(req.body);
      
      // In a real app, verify that the user is a Guiding Star
      // const user = await storage.getUser(req.session.userId!);
      // if (!user.isGuidingStar) {
      //   return res.status(403).json({ message: "Only Guiding Stars can create forum topics" });
      // }
      
      const topic = await storage.createForumTopic(topicData);
      res.status(201).json(topic);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating forum topic" });
    }
  });
  
  app.get("/api/forum/topics/:id/replies", async (req, res) => {
    try {
      const topicId = parseInt(req.params.id);
      
      // Check if topic exists
      const topic = await storage.getForumTopic(topicId);
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      
      // In a real app, check if user is a Guiding Star
      // const user = await storage.getUser(req.session.userId!);
      // if (!user.isGuidingStar) {
      //   return res.status(403).json({ message: "Only Guiding Stars can view forum replies" });
      // }
      
      const replies = await storage.getForumRepliesByTopic(topicId);
      res.json(replies);
    } catch (error) {
      res.status(500).json({ message: "Error fetching forum replies" });
    }
  });
  
  app.post("/api/forum/replies", async (req, res) => {
    try {
      const replyData = insertForumReplySchema.parse(req.body);
      
      // Check if topic exists
      const topic = await storage.getForumTopic(replyData.topicId);
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      
      // In a real app, verify that the user is a Guiding Star
      // const user = await storage.getUser(req.session.userId!);
      // if (!user.isGuidingStar) {
      //   return res.status(403).json({ message: "Only Guiding Stars can reply to forum topics" });
      // }
      
      const reply = await storage.createForumReply(replyData);
      res.status(201).json(reply);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating forum reply" });
    }
  });
}