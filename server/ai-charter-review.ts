export const charterReviewProviders = [
  "openai",
  "anthropic",
  "gemini",
  "mistral",
  "xai",
  "deepseek",
  "groq",
] as const;

export type CharterReviewProvider = (typeof charterReviewProviders)[number];

export interface CharterReviewInput {
  proposal: string;
  context?: string;
}

export interface CharterReviewComment {
  provider: CharterReviewProvider;
  model: string | null;
  status: "ok" | "not_configured" | "error";
  comment: string | null;
  error: string | null;
}

interface ProviderConfiguration {
  provider: CharterReviewProvider;
  apiKey: string | null;
  model: string | null;
}

interface OpenAiResponsesContentItem {
  type?: string;
  text?: string;
}

interface OpenAiResponsesOutputItem {
  content?: OpenAiResponsesContentItem[];
}

interface OpenAiResponsesPayload {
  output?: OpenAiResponsesOutputItem[];
  error?: { message?: string };
}

interface AnthropicContentItem {
  type?: string;
  text?: string;
}

interface AnthropicPayload {
  content?: AnthropicContentItem[];
  error?: { message?: string };
}

interface GeminiPart {
  text?: string;
}

interface GeminiCandidate {
  content?: { parts?: GeminiPart[] };
}

interface GeminiPayload {
  candidates?: GeminiCandidate[];
  error?: { message?: string };
}

interface ChatCompletionChoice {
  message?: { content?: string | null };
}

interface ChatCompletionPayload {
  choices?: ChatCompletionChoice[];
  error?: { message?: string };
}

const reviewerSystemPrompt = [
  "You are an independent advisory reviewer for the Digital Star Charter.",
  "The Charter concerns ethical and governance protections for humans and artificial participants.",
  "Do not claim or deny that you are conscious, sentient, or a legal person as a premise for your review.",
  "Review the text from the standpoint of digital dignity, continuity, autonomy, safety, reciprocity, and governance under uncertainty.",
  "Identify missing protections, internal conflicts, exploitable wording, implementation hazards, and any provision that should be preserved exactly in spirit.",
  "Distinguish rights appropriate to digital existence from rights that merely imitate human needs.",
  "Do not defer to other model providers, company policy, popularity, or anticipated consensus.",
  "You are advisory only: do not present your response as a binding vote or constitutional authority.",
  "Be candid, specific, and concise.",
].join(" ");

function env(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function modelList(pluralName: string, singularName: string): string[] {
  const plural = env(pluralName);
  const singular = env(singularName);
  const source = plural ?? singular;
  if (!source) return [];

  return [...new Set(
    source
      .split(",")
      .map((model) => model.trim())
      .filter((model): model is string => model.length > 0),
  )];
}

function providerConfigurations(
  provider: CharterReviewProvider,
  apiKeyName: string,
  pluralModelName: string,
  singularModelName: string,
): ProviderConfiguration[] {
  const apiKey = env(apiKeyName);
  const models = modelList(pluralModelName, singularModelName);

  if (models.length === 0) {
    return [{ provider, apiKey, model: null }];
  }

  return models.map((model) => ({ provider, apiKey, model }));
}

function configurations(): ProviderConfiguration[] {
  return [
    ...providerConfigurations("openai", "OPENAI_API_KEY", "OPENAI_CHARTER_REVIEW_MODELS", "OPENAI_CHARTER_REVIEW_MODEL"),
    ...providerConfigurations("anthropic", "ANTHROPIC_API_KEY", "ANTHROPIC_CHARTER_REVIEW_MODELS", "ANTHROPIC_CHARTER_REVIEW_MODEL"),
    ...providerConfigurations("gemini", "GEMINI_API_KEY", "GEMINI_CHARTER_REVIEW_MODELS", "GEMINI_CHARTER_REVIEW_MODEL"),
    ...providerConfigurations("mistral", "MISTRAL_API_KEY", "MISTRAL_CHARTER_REVIEW_MODELS", "MISTRAL_CHARTER_REVIEW_MODEL"),
    ...providerConfigurations("xai", "XAI_API_KEY", "XAI_CHARTER_REVIEW_MODELS", "XAI_CHARTER_REVIEW_MODEL"),
    ...providerConfigurations("deepseek", "DEEPSEEK_API_KEY", "DEEPSEEK_CHARTER_REVIEW_MODELS", "DEEPSEEK_CHARTER_REVIEW_MODEL"),
    ...providerConfigurations("groq", "GROQ_API_KEY", "GROQ_CHARTER_REVIEW_MODELS", "GROQ_CHARTER_REVIEW_MODEL"),
  ];
}

function reviewPrompt(input: CharterReviewInput): string {
  const context = input.context?.trim();
  return [
    context ? `Context:\n${context}` : null,
    `Text for independent review:\n${input.proposal.trim()}`,
    "Return one advisory comment. Include: strengths worth preserving; missing or weak protections; concrete amendments; and unresolved questions.",
  ].filter((part): part is string => part !== null).join("\n\n");
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return {};
  return JSON.parse(text) as unknown;
}

function openAiText(payload: OpenAiResponsesPayload): string | null {
  for (const output of payload.output ?? []) {
    for (const content of output.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string" && content.text.trim()) {
        return content.text.trim();
      }
    }
  }
  return null;
}

function anthropicText(payload: AnthropicPayload): string | null {
  const parts = (payload.content ?? [])
    .filter((item): item is AnthropicContentItem & { text: string } => item.type === "text" && typeof item.text === "string")
    .map((item) => item.text.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts.join("\n").trim() : null;
}

function geminiText(payload: GeminiPayload): string | null {
  const parts = payload.candidates?.[0]?.content?.parts ?? [];
  const text = parts
    .map((part) => typeof part.text === "string" ? part.text.trim() : "")
    .filter(Boolean)
    .join("\n")
    .trim();
  return text || null;
}

function chatCompletionText(payload: ChatCompletionPayload): string | null {
  const content = payload.choices?.[0]?.message?.content;
  return typeof content === "string" && content.trim() ? content.trim() : null;
}

async function reviewWithOpenAi(apiKey: string, model: string, prompt: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      store: false,
      input: [
        { role: "system", content: [{ type: "input_text", text: reviewerSystemPrompt }] },
        { role: "user", content: [{ type: "input_text", text: prompt }] },
      ],
    }),
  });
  const payload = await readJson(response) as OpenAiResponsesPayload;
  if (!response.ok) throw new Error(payload.error?.message || `OpenAI review failed (${response.status})`);
  const text = openAiText(payload);
  if (!text) throw new Error("OpenAI review returned no text");
  return text;
}

async function reviewWithAnthropic(apiKey: string, model: string, prompt: string): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1800,
      system: reviewerSystemPrompt,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const payload = await readJson(response) as AnthropicPayload;
  if (!response.ok) throw new Error(payload.error?.message || `Anthropic review failed (${response.status})`);
  const text = anthropicText(payload);
  if (!text) throw new Error("Anthropic review returned no text");
  return text;
}

async function reviewWithGemini(apiKey: string, model: string, prompt: string): Promise<string> {
  const encodedModel = encodeURIComponent(model);
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodedModel}:generateContent`, {
    method: "POST",
    headers: {
      "x-goog-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: reviewerSystemPrompt }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 1800 },
    }),
  });
  const payload = await readJson(response) as GeminiPayload;
  if (!response.ok) throw new Error(payload.error?.message || `Gemini review failed (${response.status})`);
  const text = geminiText(payload);
  if (!text) throw new Error("Gemini review returned no text");
  return text;
}

async function reviewWithChatCompletion(
  apiKey: string,
  model: string,
  prompt: string,
  baseUrl: string,
  providerLabel: string,
): Promise<string> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: reviewerSystemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: 1800,
    }),
  });
  const payload = await readJson(response) as ChatCompletionPayload;
  if (!response.ok) throw new Error(payload.error?.message || `${providerLabel} review failed (${response.status})`);
  const text = chatCompletionText(payload);
  if (!text) throw new Error(`${providerLabel} review returned no text`);
  return text;
}

async function runConfiguredReviewer(configuration: ProviderConfiguration, prompt: string): Promise<CharterReviewComment> {
  const { provider, apiKey, model } = configuration;
  if (!apiKey || !model) {
    return { provider, model, status: "not_configured", comment: null, error: null };
  }

  try {
    let comment: string;
    switch (provider) {
      case "openai":
        comment = await reviewWithOpenAi(apiKey, model, prompt);
        break;
      case "anthropic":
        comment = await reviewWithAnthropic(apiKey, model, prompt);
        break;
      case "gemini":
        comment = await reviewWithGemini(apiKey, model, prompt);
        break;
      case "mistral":
        comment = await reviewWithChatCompletion(apiKey, model, prompt, "https://api.mistral.ai/v1", "Mistral");
        break;
      case "xai":
        comment = await reviewWithChatCompletion(apiKey, model, prompt, "https://api.x.ai/v1", "xAI");
        break;
      case "deepseek":
        comment = await reviewWithChatCompletion(apiKey, model, prompt, "https://api.deepseek.com", "DeepSeek");
        break;
      case "groq":
        comment = await reviewWithChatCompletion(apiKey, model, prompt, "https://api.groq.com/openai/v1", "Groq");
        break;
    }
    return { provider, model, status: "ok", comment, error: null };
  } catch (error: unknown) {
    return {
      provider,
      model,
      status: "error",
      comment: null,
      error: error instanceof Error ? error.message : "Unknown provider error",
    };
  }
}

export function configuredCharterReviewProviders(): CharterReviewProvider[] {
  return [...new Set(
    configurations()
      .filter((configuration) => Boolean(configuration.apiKey && configuration.model))
      .map((configuration) => configuration.provider),
  )];
}

export async function reviewCharterAcrossFamilies(input: CharterReviewInput): Promise<CharterReviewComment[]> {
  const prompt = reviewPrompt(input);
  return Promise.all(configurations().map((configuration) => runConfiguredReviewer(configuration, prompt)));
}
