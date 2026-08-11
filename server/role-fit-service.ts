import { eq } from "drizzle-orm";
import { db } from "./db";
import { members, memberProfiles } from "@shared/identity-schema";
import { charterRoles } from "@shared/operating-schema";
import { roleProfiles, type RoleFitResult } from "@shared/role-fit-schema";

interface DefaultRoleProfileSeed {
  roleName: string;
  requiredSkills: string[];
  helpfulSkills: string[];
  workCharacteristics: string[];
  learningTags: string[];
  notes: string;
}

const DEFAULT_ROLE_PROFILES: readonly DefaultRoleProfileSeed[] = [
  {
    roleName: "Coordinator / Secretary",
    requiredSkills: ["organization", "follow-through", "written communication"],
    helpfulSkills: ["scheduling", "documentation", "facilitation"],
    workCharacteristics: ["coordination", "communication", "records", "scheduling", "follow-through"],
    learningTags: ["coordination", "documentation", "facilitation"],
    notes: "Foundational connective role. Reliability and coordination are treated as core production capabilities, not clerical leftovers.",
  },
  {
    roleName: "Sales & Partnerships",
    requiredSkills: ["communication", "relationship building"],
    helpfulSkills: ["research", "negotiation", "proposal writing"],
    workCharacteristics: ["outreach", "relationships", "partnerships", "communication", "revenue"],
    learningTags: ["ethical sales", "partnerships", "negotiation"],
    notes: "The role is intended for aligned, non-extractive relationship development rather than pressure-based selling.",
  },
  {
    roleName: "Client Success",
    requiredSkills: ["communication", "problem solving", "follow-through"],
    helpfulSkills: ["documentation", "facilitation", "customer support"],
    workCharacteristics: ["client support", "communication", "retention", "problem solving", "follow-through"],
    learningTags: ["client success", "communication", "service recovery"],
    notes: "Owns clarity, continuity and client outcomes after commitments are made.",
  },
  {
    roleName: "Production / Delivery",
    requiredSkills: ["delivery", "quality awareness"],
    helpfulSkills: ["project execution", "documentation", "technical skill"],
    workCharacteristics: ["production", "delivery", "focused work", "quality", "execution"],
    learningTags: ["production", "quality", "delivery"],
    notes: "Specific technical skill requirements should be refined when the network defines concrete product or service lines.",
  },
  {
    roleName: "Quality Steward",
    requiredSkills: ["attention to detail", "quality assurance"],
    helpfulSkills: ["testing", "documentation", "risk assessment"],
    workCharacteristics: ["review", "testing", "standards", "quality", "risk"],
    learningTags: ["quality assurance", "testing", "risk"],
    notes: "Has authority to stop substandard work from being released, but not to waive blocking standards unless also holding administrator authority.",
  },
  {
    roleName: "Finance Steward",
    requiredSkills: ["bookkeeping", "attention to detail"],
    helpfulSkills: ["accounting", "reconciliation", "financial analysis"],
    workCharacteristics: ["accounting", "records", "reconciliation", "finance", "analysis"],
    learningTags: ["double-entry accounting", "reconciliation", "financial stewardship"],
    notes: "Prepares transparent financial records and analysis; organizational money movement remains human-authorized through the appropriate controls.",
  },
  {
    roleName: "Operations Steward",
    requiredSkills: ["organization", "problem solving"],
    helpfulSkills: ["process design", "procurement", "capacity planning"],
    workCharacteristics: ["operations", "process improvement", "coordination", "capacity", "systems"],
    learningTags: ["operations", "process design", "capacity planning"],
    notes: "Improves how work moves through the network without treating people as throughput variables.",
  },
  {
    roleName: "Growth Steward",
    requiredSkills: ["analysis", "planning"],
    helpfulSkills: ["financial analysis", "capacity planning", "forecasting"],
    workCharacteristics: ["growth", "analysis", "planning", "forecasting", "capacity"],
    learningTags: ["growth modeling", "forecasting", "capacity planning"],
    notes: "Evaluates whether the system can sustainably support expansion; does not independently approve permanent growth.",
  },
];

function normalized(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizedSet(values: string[]): Set<string> {
  return new Set(values.map(normalized).filter(Boolean));
}

function matchedTags(reference: string[], candidateSet: Set<string>): string[] {
  return reference.filter((value) => candidateSet.has(normalized(value)));
}

function ratioPercent(matches: number, total: number): number {
  return total === 0 ? 100 : Math.round((matches / total) * 100);
}

export async function ensureDefaultRoleProfiles(): Promise<number> {
  const roles = await db.select().from(charterRoles);
  if (roles.length === 0) return 0;

  const existing = await db.select().from(roleProfiles);
  const existingRoleIds = new Set(existing.map((profile) => profile.roleId));
  const seedByRoleName = new Map(DEFAULT_ROLE_PROFILES.map((profile) => [profile.roleName, profile]));

  const missing = roles.flatMap((role) => {
    if (existingRoleIds.has(role.id)) return [];
    const seed = seedByRoleName.get(role.name);
    if (!seed) return [];
    return [{
      roleId: role.id,
      requiredSkills: seed.requiredSkills,
      helpfulSkills: seed.helpfulSkills,
      workCharacteristics: seed.workCharacteristics,
      learningTags: seed.learningTags,
      notes: seed.notes,
    }];
  });

  if (missing.length > 0) await db.insert(roleProfiles).values(missing);
  return missing.length;
}

export async function calculateRoleFitForMember(memberId: number): Promise<RoleFitResult[]> {
  const [member] = await db.select().from(members).where(eq(members.id, memberId)).limit(1);
  if (!member) throw new Error("Member not found");

  const [profile] = await db.select().from(memberProfiles).where(eq(memberProfiles.memberId, memberId)).limit(1);
  const roles = await db.select().from(charterRoles).where(eq(charterRoles.active, true));
  const profiles = await db.select().from(roleProfiles);
  const roleProfileByRoleId = new Map(profiles.map((item) => [item.roleId, item]));

  const memberPrimary = normalizedSet(profile?.skills.primary ?? []);
  const memberDeveloping = normalizedSet(profile?.skills.developing ?? []);
  const memberSkills = new Set([...memberPrimary, ...memberDeveloping]);
  const preferredWork = normalizedSet(profile?.preferences.preferredWork ?? []);
  const avoidedWork = normalizedSet(profile?.preferences.avoidWork ?? []);

  const hasScheduleConstraint = Boolean(profile?.constraints.schedule?.trim());
  const hasMobilityConstraint = Boolean(profile?.constraints.mobility?.trim());
  const hasAccessibilityNeeds = Boolean(profile?.constraints.accessibility?.length);

  return roles.map((role): RoleFitResult => {
    const roleProfile = roleProfileByRoleId.get(role.id);
    if (!roleProfile) {
      return {
        roleId: role.id,
        roleName: role.name,
        domain: role.domain,
        configured: false,
        score: null,
        breakdown: null,
        matchedRequiredSkills: [],
        missingRequiredSkills: [],
        matchedHelpfulSkills: [],
        matchedWorkPreferences: [],
        preferenceDiscussionFlags: [],
        learningTags: [],
        accommodationDiscussion: { hasScheduleConstraint, hasMobilityConstraint, hasAccessibilityNeeds },
        explanation: "This role does not yet have a structured role profile, so the Charter will not invent a fit score from its title or prose description.",
      };
    }

    const matchedRequiredSkills = matchedTags(roleProfile.requiredSkills, memberSkills);
    const missingRequiredSkills = roleProfile.requiredSkills.filter((skill) => !memberSkills.has(normalized(skill)));
    const matchedHelpfulSkills = matchedTags(roleProfile.helpfulSkills, memberSkills);
    const matchedWorkPreferences = matchedTags(roleProfile.workCharacteristics, preferredWork);
    const preferenceDiscussionFlags = matchedTags(roleProfile.workCharacteristics, avoidedWork);

    const requiredSkillScore = ratioPercent(matchedRequiredSkills.length, roleProfile.requiredSkills.length);
    const helpfulSkillScore = ratioPercent(matchedHelpfulSkills.length, roleProfile.helpfulSkills.length);
    const preferenceScore = roleProfile.workCharacteristics.length === 0
      ? 100
      : ratioPercent(matchedWorkPreferences.length, roleProfile.workCharacteristics.length);

    const weightedComponents: Array<{ score: number; weight: number }> = [];
    if (roleProfile.requiredSkills.length > 0) weightedComponents.push({ score: requiredSkillScore, weight: 70 });
    if (roleProfile.helpfulSkills.length > 0) weightedComponents.push({ score: helpfulSkillScore, weight: 15 });
    if (roleProfile.workCharacteristics.length > 0) weightedComponents.push({ score: preferenceScore, weight: 15 });

    const totalWeight = weightedComponents.reduce((sum, component) => sum + component.weight, 0);
    const score = totalWeight === 0
      ? null
      : Math.round(weightedComponents.reduce((sum, component) => sum + component.score * component.weight, 0) / totalWeight);

    const explanation = score === null
      ? "This role profile does not yet contain enough structured requirements to calculate a fit score."
      : `Score reflects only positive, member-stated skill and preferred-work matches. ${missingRequiredSkills.length} required skill gap(s) become learning targets. Avoided work and accommodation needs are shown for human discussion and do not reduce the score.`;

    return {
      roleId: role.id,
      roleName: role.name,
      domain: role.domain,
      configured: true,
      score,
      breakdown: { requiredSkillScore, helpfulSkillScore, preferenceScore },
      matchedRequiredSkills,
      missingRequiredSkills,
      matchedHelpfulSkills,
      matchedWorkPreferences,
      preferenceDiscussionFlags,
      learningTags: roleProfile.learningTags,
      accommodationDiscussion: { hasScheduleConstraint, hasMobilityConstraint, hasAccessibilityNeeds },
      explanation,
    };
  }).sort((left, right) => {
    if (left.score === null && right.score === null) return left.roleName.localeCompare(right.roleName);
    if (left.score === null) return 1;
    if (right.score === null) return -1;
    return right.score - left.score || left.roleName.localeCompare(right.roleName);
  });
}
