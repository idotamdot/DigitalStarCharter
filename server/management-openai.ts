import { z } from "zod";
import type { ManagementSnapshot } from "@shared/ai-management-schema";
import type { DeterministicFinding } from "./management-rules";

const synthesisItemSchema = z.object({
  findingId: z.number().int().nonnegative(),
  priority: z.number().int().min(1).max(100),
  recommendation: z.string().trim().min(1).max(1600),
  rationale: z.string().trim().min(1).max(1600),
});

const synthesisSchema = z.object({
  executiveSummary: z.string().trim().min(1).max(2400),
  items: z.array(synthesisItemSchema).max(30),
});

export type ManagementSynthesis = z.infer<typeof synthesisSchema>;

interface ResponsesContentItem {
  type?: string;
  text?: string;
}

interface ResponsesOutputItem {
  type?: string;
  content?: ResponsesContentItem[];
}

interface ResponsesApiResponse {
  output?: ResponsesOutputItem[];
  error?: {
    message?: string;
  };
}

interface SynthesisFindingInput {
  findingId: number;
  domain: string;
  severity: string;
  title: string;
  summary: string;
  recommendation: string;
  rationale: string;
  evidenceFacts: string[];
}

function extractOutputText(response: ResponsesApiResponse): string {
  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        return content.text;
      }
    }
  }
  throw new Error(response.error?.message || "OpenAI management synthesis returned no output text");
}

function responseSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["executiveSummary", "items"],
    properties: {
      executiveSummary: { type: "string" },
      items: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["findingId", "priority", "recommendation", "rationale"],
          properties: {
            findingId: { type: "integer" },
            priority: { type: "integer", minimum: 1, maximum: 100 },
            recommendation: { type: "string" },
            rationale: { type: "string" },
          },
        },
      },
    },
  } as const;
}

export function openAiManagementConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim() && process.env.OPENAI_MANAGEMENT_MODEL?.trim());
}

export async function synthesizeManagementFindings(
  snapshot: ManagementSnapshot,
  findings: DeterministicFinding[],
): Promise<ManagementSynthesis> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_MANAGEMENT_MODEL?.trim();
  if (!apiKey || !model) {
    throw new Error("OPENAI_API_KEY and OPENAI_MANAGEMENT_MODEL are both required for hybrid management synthesis");
  }

  const findingInputs: SynthesisFindingInput[] = findings.map((finding, index) => ({
    findingId: index,
    domain: finding.domain,
    severity: finding.severity,
    title: finding.title,
    summary: finding.summary,
    recommendation: finding.recommendation,
    rationale: finding.rationale,
    evidenceFacts: finding.evidence.map((item) => item.fact),
  }));

  const requestBody = {
    model,
    store: false,
    input: [
      {
        role: "system",
        content: [{
          type: "input_text",
          text: [
            "You are the synthesis layer for a human-governed cooperative operating system.",
            "All factual findings have already been produced deterministically from the database.",
            "You may prioritize and clarify ONLY the supplied findings.",
            "Do not invent facts, people, causes, diagnoses, financial numbers, missing evidence, or new findings.",
            "Do not recommend executing consequential actions automatically.",
            "Goodness Gate blockers are constitutional production blockers: do not recommend bypassing, waiving, deprioritizing, or working around them. The proposal must be revised until every active Goodness criterion passes, or it must not be made.",
            "Keep human approval explicit for hiring, firing, compensation, money movement, role assignment, quality waivers, governance changes, and growth decisions.",
            "Return every supplied finding exactly once by its findingId.",
          ].join(" "),
        }],
      },
      {
        role: "user",
        content: [{
          type: "input_text",
          text: JSON.stringify({ snapshot, findings: findingInputs }),
        }],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "charter_management_synthesis",
        strict: true,
        schema: responseSchema(),
      },
    },
  };

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const raw: unknown = await response.json();
  const parsedResponse = raw as ResponsesApiResponse;
  if (!response.ok) {
    throw new Error(parsedResponse.error?.message || `OpenAI management synthesis failed (${response.status})`);
  }

  const outputText = extractOutputText(parsedResponse);
  const parsedJson: unknown = JSON.parse(outputText) as unknown;
  const synthesis = synthesisSchema.parse(parsedJson);

  const expectedIds = new Set(findings.map((_, index) => index));
  const returnedIds = new Set(synthesis.items.map((item) => item.findingId));
  if (returnedIds.size !== expectedIds.size || [...expectedIds].some((id) => !returnedIds.has(id))) {
    throw new Error("OpenAI management synthesis did not return every deterministic finding exactly once");
  }

  return synthesis;
}
