import type { NextFunction, Request, Response } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { charterRoles, roleAssignments, authorityAuditLog } from "@shared/operating-schema";
import type { User } from "@shared/schema";

export type CharterCapability =
  | "admin"
  | "roles.assign"
  | "governance.manage"
  | "finance.record"
  | "finance.distribute"
  | "growth.evaluate"
  | "growth.approve"
  | "work.create"
  | "work.assign"
  | "quality.manage"
  | "catalog.manage"
  | "learning.manage"
  | "ai.propose"
  | "ai.review"
  | "ai.execute";

const capabilityDomains: Partial<Record<CharterCapability, readonly string[]>> = {
  "finance.record": ["finance"],
  "growth.evaluate": ["growth", "finance", "work"],
  "work.create": ["work", "people", "quality", "growth", "finance"],
  "work.assign": ["work", "people"],
  "quality.manage": ["quality"],
  "catalog.manage": ["work", "quality"],
  "learning.manage": ["people", "quality"],
  "ai.propose": ["people", "work", "finance", "quality", "growth"],
};

const adminOnly = new Set<CharterCapability>([
  "admin",
  "roles.assign",
  "governance.manage",
  "finance.distribute",
  "growth.approve",
  "ai.review",
  "ai.execute",
]);

export interface AccessSnapshot {
  isAdmin: boolean;
  domains: string[];
  capabilities: CharterCapability[];
}

export function configuredAdminEmail(): string | null {
  return process.env.ADMIN?.trim().toLowerCase() || null;
}

export function isConfiguredAdmin(user: User | undefined): boolean {
  const adminEmail = configuredAdminEmail();
  return Boolean(adminEmail && user?.email?.trim().toLowerCase() === adminEmail);
}

export async function getAccessSnapshot(user: User): Promise<AccessSnapshot> {
  const isAdmin = isConfiguredAdmin(user);
  if (isAdmin) {
    return {
      isAdmin: true,
      domains: ["people", "work", "finance", "quality", "growth", "governance"],
      capabilities: [
        "admin",
        "roles.assign",
        "governance.manage",
        "finance.record",
        "finance.distribute",
        "growth.evaluate",
        "growth.approve",
        "work.create",
        "work.assign",
        "quality.manage",
        "catalog.manage",
        "learning.manage",
        "ai.propose",
        "ai.review",
        "ai.execute",
      ],
    };
  }

  const rows = await db
    .select({ domain: charterRoles.domain })
    .from(roleAssignments)
    .innerJoin(charterRoles, eq(roleAssignments.roleId, charterRoles.id))
    .where(and(
      eq(roleAssignments.userId, user.id),
      eq(roleAssignments.status, "active"),
      eq(charterRoles.active, true),
      eq(charterRoles.humanAuthority, true),
    ));

  const domains = [...new Set(rows.map((row) => row.domain))];
  const capabilities = (Object.keys(capabilityDomains) as CharterCapability[]).filter((capability) => {
    const allowedDomains = capabilityDomains[capability] ?? [];
    return allowedDomains.some((domain) => domains.includes(domain));
  });

  return { isAdmin: false, domains, capabilities };
}

export async function userHasCapability(user: User, capability: CharterCapability): Promise<boolean> {
  if (isConfiguredAdmin(user)) return true;
  if (adminOnly.has(capability)) return false;
  const snapshot = await getAccessSnapshot(user);
  return snapshot.capabilities.includes(capability);
}

export function requireCapability(capability: CharterCapability) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Neon Auth sign-in required" });
    if (!(await userHasCapability(req.user, capability))) {
      return res.status(403).json({ message: `Missing required authority: ${capability}` });
    }
    next();
  };
}

export async function writeAuthorityAudit(input: {
  actor?: User;
  authority: string;
  action: string;
  targetType: string;
  targetId?: string | number | null;
  outcome?: string;
  reason?: string | null;
  metadata?: Record<string, unknown>;
}) {
  await db.insert(authorityAuditLog).values({
    actorUserId: input.actor?.id ?? null,
    actorEmail: input.actor?.email ?? null,
    authority: input.authority,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId == null ? null : String(input.targetId),
    outcome: input.outcome ?? "completed",
    reason: input.reason ?? null,
    metadata: input.metadata ?? {},
  });
}
