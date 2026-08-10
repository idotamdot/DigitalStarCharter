import type { Express, Request, Response, NextFunction } from "express";
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { verifyNeonJwt } from "./neon-auth";
import { users, type User } from "@shared/schema";

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

async function getOrCreateAppUser(token: string): Promise<User> {
  const identity = await verifyNeonJwt(token);
  const email = identity.email?.trim().toLowerCase();
  if (!email) {
    throw new Error("Authenticated Neon identity has no email address");
  }

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

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = bearerToken(req);
    if (!token) {
      return res.status(401).json({ message: "Neon Auth sign-in required" });
    }

    req.user = await getOrCreateAppUser(token);
    next();
  } catch (error) {
    return res.status(401).json({
      message: error instanceof Error ? error.message : "Invalid Neon Auth session",
    });
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  await requireAuth(req, res, () => {
    const adminEmail = process.env.ADMIN?.trim().toLowerCase();
    const userEmail = req.user?.email?.trim().toLowerCase();

    if (!adminEmail) {
      res.status(503).json({ message: "ADMIN is not configured" });
      return;
    }

    if (!userEmail || userEmail !== adminEmail) {
      res.status(403).json({ message: "Administrator access required" });
      return;
    }

    next();
  });
}

export function setupAuth(app: Express) {
  app.post("/api/register", (_req, res) => {
    res.status(410).json({ message: "Password registration has been retired. Use Neon magic-link sign-in." });
  });

  app.post("/api/login", (_req, res) => {
    res.status(410).json({ message: "Password login has been retired. Use Neon magic-link sign-in." });
  });

  app.post("/api/logout", (_req, res) => {
    res.status(204).end();
  });

  app.get("/api/user", requireAuth, (req, res) => {
    const { password: _password, ...safeUser } = req.user as User;
    res.json(safeUser);
  });

  app.get("/api/admin/status", requireAuth, (req, res) => {
    const adminEmail = process.env.ADMIN?.trim().toLowerCase();
    const userEmail = req.user?.email?.trim().toLowerCase();
    res.json({
      isAdmin: Boolean(adminEmail && userEmail === adminEmail),
      email: userEmail ?? null,
    });
  });
}
