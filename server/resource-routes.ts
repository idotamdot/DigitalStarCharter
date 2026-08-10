import type { Express } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "./db";
import { requireAuth } from "./auth";
import { getAccessSnapshot, requireCapability } from "./access-control";
import {
  insertResourceSchema,
  resources,
  type Resource,
  type ResourceAccessLevel,
  type ResourceApi,
} from "@shared/resource-schema";

const accessRank: Record<ResourceAccessLevel, number> = {
  open: 0,
  member: 1,
  steward: 2,
};

function toApi(resource: Resource): ResourceApi {
  return {
    ...resource,
    createdAt: resource.createdAt.toISOString(),
    updatedAt: resource.updatedAt.toISOString(),
  };
}

async function viewerAccessLevel(memberId: number | undefined): Promise<ResourceAccessLevel> {
  if (!memberId) return "open";
  const requestMember = await import("@shared/identity-schema");
  const [member] = await db.select().from(requestMember.members).where(eq(requestMember.members.id, memberId)).limit(1);
  if (!member) return "open";
  const access = await getAccessSnapshot(member);
  return access.capabilities.includes("catalog.manage") || access.capabilities.includes("learning.manage")
    ? "steward"
    : "member";
}

function canAccess(resource: Resource, level: ResourceAccessLevel): boolean {
  return accessRank[level] >= accessRank[resource.accessLevel];
}

export function registerResourceRoutes(app: Express) {
  app.get("/api/resources", async (req, res) => {
    const level = await viewerAccessLevel(req.member?.id);
    const category = typeof req.query.category === "string" ? req.query.category : null;
    const all = category
      ? await db.select().from(resources).where(eq(resources.category, category)).orderBy(resources.title)
      : await db.select().from(resources).orderBy(resources.title);
    res.json(all.filter((resource) => canAccess(resource, level)).map(toApi));
  });

  app.get("/api/resources/:id", async (req, res) => {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const [resource] = await db.select().from(resources).where(eq(resources.id, id)).limit(1);
    if (!resource) return res.status(404).json({ message: "Resource not found" });

    const level = await viewerAccessLevel(req.member?.id);
    if (!canAccess(resource, level)) {
      return res.status(req.member ? 403 : 401).json({ message: "This resource requires member access" });
    }
    res.json(toApi(resource));
  });

  app.post("/api/resources", requireAuth, requireCapability("catalog.manage"), async (req, res) => {
    const input = insertResourceSchema.parse({
      ...req.body,
      createdByMemberId: req.member!.id,
    });
    const [created] = await db.insert(resources).values(input).returning();
    res.status(201).json(toApi(created));
  });

  app.patch("/api/resources/:id", requireAuth, requireCapability("catalog.manage"), async (req, res) => {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const changes = insertResourceSchema.partial().parse(req.body);
    const [updated] = await db.update(resources).set({
      ...changes,
      updatedAt: new Date(),
    }).where(eq(resources.id, id)).returning();
    if (!updated) return res.status(404).json({ message: "Resource not found" });
    res.json(toApi(updated));
  });
}
