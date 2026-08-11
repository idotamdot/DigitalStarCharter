export const charterCapabilities = [
  "admin",
  "roles.assign",
  "governance.manage",
  "finance.record",
  "finance.distribute",
  "growth.evaluate",
  "growth.approve",
  "work.create",
  "work.assign",
  "goodness.review",
  "goodness.manage",
  "quality.manage",
  "quality.override",
  "catalog.manage",
  "learning.manage",
  "ai.propose",
  "ai.review",
  "ai.execute",
] as const;

export type CharterCapability = (typeof charterCapabilities)[number];

export interface AuthorityStatus {
  isAdmin: boolean;
  email: string | null;
  domains: string[];
  capabilities: CharterCapability[];
}
