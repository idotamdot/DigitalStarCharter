import type { NextFunction, Request, Response } from "express";
import { memberHasCapability, writeAuthorityAudit, type CharterCapability } from "./access-control";

interface LegacyRule {
  method: string;
  pattern: RegExp;
  capability: CharterCapability;
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
  if (!req.member) return res.status(401).json({ message: "Neon Auth sign-in required" });

  const allowed = await memberHasCapability(req.member, rule.capability);
  if (!allowed) {
    await writeAuthorityAudit({
      actor: req.member,
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
