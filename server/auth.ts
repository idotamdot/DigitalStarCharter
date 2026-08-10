import type { Express, Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { verifyNeonJwt } from "./neon-auth";
import { getAccessSnapshot, isConfiguredAdmin } from "./access-control";
import { members, memberProfiles, type Member } from "@shared/identity-schema";

declare global {
  namespace Express {
    interface Request {
      member?: Member;
    }
  }
}

function bearerToken(req: Request): string | null {
  const authorization = req.headers.authorization;
  return authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;
}

async function getOrCreateMember(token: string): Promise<Member> {
  const identity = await verifyNeonJwt(token);
  const email = identity.email?.trim().toLowerCase();
  if (!email) throw new Error("Authenticated Neon identity has no email address");

  const [bySubject] = await db.select().from(members).where(eq(members.authSubject, identity.sub)).limit(1);
  if (bySubject) {
    if (bySubject.email !== email || (identity.name?.trim() && bySubject.displayName !== identity.name.trim())) {
      const [updated] = await db.update(members).set({
        email,
        displayName: identity.name?.trim() || bySubject.displayName,
        updatedAt: new Date(),
      }).where(eq(members.id, bySubject.id)).returning();
      return updated;
    }
    return bySubject;
  }

  const [byEmail] = await db.select().from(members).where(eq(members.email, email)).limit(1);
  if (byEmail) {
    const [linked] = await db.update(members).set({
      authSubject: identity.sub,
      displayName: identity.name?.trim() || byEmail.displayName,
      updatedAt: new Date(),
    }).where(eq(members.id, byEmail.id)).returning();
    return linked;
  }

  const [created] = await db.insert(members).values({
    authSubject: identity.sub,
    email,
    displayName: identity.name?.trim() || email.split("@")[0],
  }).returning();

  await db.insert(memberProfiles).values({ memberId: created.id });
  return created;
}

async function resolveOptionalIdentity(req: Request): Promise<void> {
  if (req.member) return;
  const token = bearerToken(req);
  if (!token) return;
  req.member = await getOrCreateMember(token);
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    await resolveOptionalIdentity(req);
    if (!req.member) return res.status(401).json({ message: "Neon Auth sign-in required" });
    next();
  } catch (error) {
    return res.status(401).json({
      message: error instanceof Error ? error.message : "Invalid Neon Auth session",
    });
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  await requireAuth(req, res, () => {
    if (!process.env.ADMIN?.trim()) {
      res.status(503).json({ message: "ADMIN is not configured" });
      return;
    }
    if (!isConfiguredAdmin(req.member)) {
      res.status(403).json({ message: "Administrator access required" });
      return;
    }
    next();
  });
}

export function setupAuth(app: Express) {
  app.use(async (req, _res, next) => {
    if (!req.path.startsWith("/api/")) return next();
    try {
      await resolveOptionalIdentity(req);
    } catch {
      // Public API routes remain public. Protected routes call requireAuth and reject.
    }
    next();
  });

  app.get("/api/member", requireAuth, (req, res) => {
    res.json(req.member);
  });

  app.get("/api/admin/status", requireAuth, async (req, res) => {
    const access = await getAccessSnapshot(req.member!);
    res.json({
      isAdmin: access.isAdmin,
      email: req.member?.email ?? null,
      domains: access.domains,
      capabilities: access.capabilities,
    });
  });
}
