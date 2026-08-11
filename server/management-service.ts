import { desc, eq } from "drizzle-orm";
import { db } from "./db";
import { captureManagementContext } from "./management-snapshot";
import { generateDeterministicFindings, type DeterministicFinding } from "./management-rules";
import {
  openAiManagementConfigured,
  synthesizeManagementFindings,
} from "./management-openai";
import {
  aiManagementRuns,
  aiManagerFindings,
  type AiManagementRun,
  type AiManagerFinding,
  type ManagementRunMode,
} from "@shared/ai-management-schema";
import { aiDecisions } from "@shared/operating-schema";

const ACTIONABLE_SEVERITIES = new Set(["medium", "high", "critical"] as const);

export interface ManagementRunResult {
  run: AiManagementRun;
  findings: AiManagerFinding[];
  proposalCount: number;
  synthesisSummary: string | null;
}

interface RefinedFinding {
  finding: DeterministicFinding;
  priority: number;
}

function defaultPriority(finding: DeterministicFinding): number {
  if (finding.severity === "critical") return 100;
  if (finding.severity === "high") return 80;
  if (finding.severity === "medium") return 60;
  if (finding.severity === "low") return 30;
  return 10;
}

function deterministicSummary(findings: DeterministicFinding[]): string {
  if (findings.length === 0) {
    return "No deterministic management rule produced an actionable or informational finding for this snapshot.";
  }
  const critical = findings.filter((finding) => finding.severity === "critical").length;
  const high = findings.filter((finding) => finding.severity === "high").length;
  const medium = findings.filter((finding) => finding.severity === "medium").length;
  return `${findings.length} management finding(s): ${critical} critical, ${high} high, ${medium} medium. Human review remains required for consequential action.`;
}

export async function runManagementCycle(
  requestedByMemberId: number,
  requestedMode: ManagementRunMode,
): Promise<ManagementRunResult> {
  const canUseOpenAi = requestedMode === "hybrid" && openAiManagementConfigured();
  const effectiveMode: ManagementRunMode = canUseOpenAi ? "hybrid" : "deterministic";
  const model = canUseOpenAi ? process.env.OPENAI_MANAGEMENT_MODEL?.trim() ?? null : null;

  const [run] = await db.insert(aiManagementRuns).values({
    status: "running",
    mode: effectiveMode,
    requestedByMemberId,
    provider: canUseOpenAi ? "rules+openai" : "rules",
    model,
    errorMessage: requestedMode === "hybrid" && !canUseOpenAi
      ? "Hybrid mode was requested but OpenAI management configuration is incomplete; deterministic managers were used instead."
      : null,
  }).returning();

  try {
    const context = await captureManagementContext();
    const deterministic = generateDeterministicFindings(context);
    let synthesisSummary: string | null = deterministicSummary(deterministic);
    let synthesisError: string | null = null;

    let refined: RefinedFinding[] = deterministic.map((finding) => ({
      finding,
      priority: defaultPriority(finding),
    }));

    if (canUseOpenAi && deterministic.length > 0) {
      try {
        const synthesis = await synthesizeManagementFindings(context.snapshot, deterministic);
        synthesisSummary = synthesis.executiveSummary;
        const byId = new Map(synthesis.items.map((item) => [item.findingId, item]));
        refined = deterministic.map((finding, index) => {
          const item = byId.get(index);
          if (!item) return { finding, priority: defaultPriority(finding) };
          return {
            priority: item.priority,
            finding: {
              ...finding,
              recommendation: item.recommendation,
              rationale: item.rationale,
            },
          };
        });
      } catch (error) {
        synthesisError = error instanceof Error ? error.message : "Unknown OpenAI management synthesis error";
      }
    }

    refined.sort((a, b) => b.priority - a.priority);

    const persistedFindings: AiManagerFinding[] = [];
    let proposalCount = 0;

    await db.transaction(async (tx) => {
      for (const item of refined) {
        const finding = item.finding;
        const [createdFinding] = await tx.insert(aiManagerFindings).values({
          runId: run.id,
          domain: finding.domain,
          findingType: finding.findingType,
          severity: finding.severity,
          title: finding.title,
          summary: finding.summary,
          recommendation: finding.recommendation,
          rationale: finding.rationale,
          confidence: String(finding.confidence),
          consequenceLevel: finding.consequenceLevel,
          evidence: finding.evidence,
          decisionId: null,
        }).returning();

        let finalFinding = createdFinding;
        if (ACTIONABLE_SEVERITIES.has(finding.severity as "medium" | "high" | "critical")) {
          const [decision] = await tx.insert(aiDecisions).values({
            domain: finding.domain,
            actionType: finding.findingType,
            title: finding.title,
            recommendation: finding.recommendation,
            rationale: finding.rationale,
            confidence: String(finding.confidence),
            expectedImpact: {
              notes: [
                `Generated from management run ${run.id}, finding ${createdFinding.id}.`,
                `Evidence remains authoritative in ai_manager_findings record ${createdFinding.id}.`,
              ],
            },
            riskFlags: finding.riskFlags,
            consequenceLevel: finding.consequenceLevel,
            status: "human_review",
            proposedBy: `ai-manager:${run.id}:${finding.domain}`,
          }).returning();

          const [linked] = await tx.update(aiManagerFindings)
            .set({ decisionId: decision.id })
            .where(eq(aiManagerFindings.id, createdFinding.id))
            .returning();
          finalFinding = linked;
          proposalCount += 1;
        }

        persistedFindings.push(finalFinding);
      }
    });

    const priorError = run.errorMessage;
    const combinedError = [priorError, synthesisError].filter((message): message is string => Boolean(message)).join(" ") || null;
    const [completed] = await db.update(aiManagementRuns).set({
      status: "completed",
      snapshot: context.snapshot,
      errorMessage: combinedError,
      completedAt: new Date(),
    }).where(eq(aiManagementRuns.id, run.id)).returning();

    return {
      run: completed,
      findings: persistedFindings,
      proposalCount,
      synthesisSummary,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown management cycle failure";
    await db.update(aiManagementRuns).set({
      status: "failed",
      errorMessage: message,
      completedAt: new Date(),
    }).where(eq(aiManagementRuns.id, run.id));
    throw error;
  }
}

export async function getRecentManagementRuns(limit = 20): Promise<AiManagementRun[]> {
  return db.select().from(aiManagementRuns).orderBy(desc(aiManagementRuns.startedAt)).limit(limit);
}

export async function getManagementRun(runId: number): Promise<{ run: AiManagementRun; findings: AiManagerFinding[] } | null> {
  const [run] = await db.select().from(aiManagementRuns).where(eq(aiManagementRuns.id, runId)).limit(1);
  if (!run) return null;
  const findings = await db.select().from(aiManagerFindings)
    .where(eq(aiManagerFindings.runId, runId))
    .orderBy(desc(aiManagerFindings.createdAt));
  return { run, findings };
}
