import type { Express, Request, Response, NextFunction } from "express";
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { verifyNeonJwt } from "./neon-auth";
import { getAccessSnapshot, isConfiguredAdmin } from "./access-control";
import { enforceGlobalAuthorization } from "./global-policy";
import { users, type User as AppUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends AppUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function createPlaceholderPassword(): Promise<string> {
  const source = randomBytes(32).toString("hex");
  const salt = randomBytes(16).toString("hex");
  const buffer = (await scryptAsync(source, salt, 64)) as Buffer;
  return `${buffer.toString("hex")}.${salt}`;
}

function bearerToken(req: Request): string | null {
  const authorization = req.headers.authorization;
  return authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;
}

async function getOrCreateAppUser(token: string): Promise<AppUser> {
  const identity = await verifyNeonJwt(token);
  const email = identity.email?.trim().toLowerCase();
  if (!email) throw new Error("Authenticated Neon identity has no email address");

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) return existing;

  const safeSubject = identity.sub.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 48);
  const [created] = await db.insert(users).values({
    username: `neon_${safeSubject}`,
    email,
    password: await createPlaceholderPassword(),
    fullName: identity.name?.trim() || email.split("@")[0],
  }).returning();

  return created;
}

async function resolveOptionalIdentity(req: Request): Promise<void> {
  if (req.user) return;
  const token = bearerToken(req);
  if (!token) return;
  req.user = await getOrCreateAppUser(token);
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    await resolveOptionalIdentity(req);
    if (!req.user) return res.status(401).json({ message: "Neon Auth sign-in required" });
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
    if (!isConfiguredAdmin(req.user)) {
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
      // Public endpoints remain public; protected endpoints re-verify and reject.
    }
    req.isAuthenticated = () => Boolean(req.user);
    next();
  });

  // Central policy runs before the legacy route declarations that follow setupAuth().
  app.use(enforceGlobalAuthorization);

  app.post("/api/register", (_req, res) => {
    res.status(410).json({ message: "Password registration has been retired. Use Neon magic-link sign-in." });
  });

  app.post("/api/login", (_req, res) => {
    res.status(410).json({ message: "Password login has been retired. Use Neon magic-link sign-in." });
  });

  app.post("/api/logout", (_req, res) => res.status(204).end());

  app.get("/api/user", requireAuth, (req, res) => {
    const { password: _password, ...safeUser } = req.user as AppUser;
    res.json(safeUser);
  });

  app.get("/api/admin/status", requireAuth, async (req, res) => {
    const access = await getAccessSnapshot(req.user!);
    res.json({
      isAdmin: access.isAdmin,
      email: req.user?.email ?? null,
      domains: access.domains,
      capabilities: access.capabilities,
    });
  });
}
