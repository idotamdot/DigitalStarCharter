import type { NextFunction, Request, Response } from "express";
import { userHasCapability, writeAuthorityAudit } from "./access-control";

interface LegacyRule {
  method: string;
  pattern: RegExp;
  capability: Parameters<typeof userHasCapability>[1];
  action: string;
  targetType: string;
}

const rules: LegacyRule[] = [
  {
    method: "POST",
    pattern: /^\/api\/constellations\/?$/,
    capability: "governance.manage",
    action: "create_constellation",
    targetType: "constellation",
  },
  {
    method: "PATCH",
    pattern: /^\/api\/constellations\/\d+\/?$/,
    capability: "governance.manage",
    action: "update_constellation",
    targetType: "constellation",
  },
];

export async function enforceGlobalAuthorization(req: Request, res: Response, next: NextFunction) {
  const rule = rules.find((candidate) => candidate.method === req.method && candidate.pattern.test(req.path));
  if (!rule) return next();
  if (!req.user) return res.status(401).json({ message: "Neon Auth sign-in required" });

  const allowed = await userHasCapability(req.user, rule.capability);
  if (!allowed) {
    await writeAuthorityAudit({
      actor: req.user,
      authority: rule.capability,
      action: rule.action,
      targetType: rule.targetType,
      outcome: "denied",
      metadata: { method: req.method, path: req.path },
    });
    return res.status(403).json({ message: `Missing required authority: ${rule.capability}` });
  }

  next();
}
