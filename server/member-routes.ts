import type { Express } from "express";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { requireAuth } from "./auth";
import {
  memberProfiles,
  members,
  updateMemberIdentitySchema,
  updateMemberProfileSchema,
} from "@shared/identity-schema";

export function registerMemberRoutes(app: Express) {
  app.get("/api/member/profile", requireAuth, async (req, res) => {
    const [profile] = await db.select().from(memberProfiles).where(eq(memberProfiles.memberId, req.member!.id)).limit(1);
    if (profile) return res.json(profile);

    const [created] = await db.insert(memberProfiles).values({ memberId: req.member!.id }).returning();
    res.json(created);
  });

  app.patch("/api/member", requireAuth, async (req, res) => {
    const input = updateMemberIdentitySchema.parse(req.body as unknown);
    const [updated] = await db.update(members).set({
      ...input,
      updatedAt: new Date(),
    }).where(eq(members.id, req.member!.id)).returning();
    req.member = updated;
    res.json(updated);
  });

  app.patch("/api/member/profile", requireAuth, async (req, res) => {
    const input = updateMemberProfileSchema.parse(req.body as unknown);
    const [existing] = await db.select().from(memberProfiles).where(eq(memberProfiles.memberId, req.member!.id)).limit(1);

    if (!existing) {
      const [created] = await db.insert(memberProfiles).values({
        memberId: req.member!.id,
        ...input,
      }).returning();
      return res.json(created);
    }

    const [updated] = await db.update(memberProfiles).set({
      ...input,
      updatedAt: new Date(),
    }).where(eq(memberProfiles.memberId, req.member!.id)).returning();
    res.json(updated);
  });
}
