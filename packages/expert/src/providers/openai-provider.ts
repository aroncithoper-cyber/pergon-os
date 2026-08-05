import type { AiProvider, CompletionInput, CompletionOutput } from "./types";

/**
 * OpenAI-compatible chat completions adapter.
 * Activated only when EXPERT_OPENAI_API_KEY (or OPENAI_API_KEY) is present.
 */
export class OpenAiProvider implements AiProvider {
  readonly id = "openai";
  readonly displayName = "OpenAI";

  constructor(
    private readonly apiKey: string | undefined = process.env.EXPERT_OPENAI_API_KEY ??
      process.env.OPENAI_API_KEY,
    private readonly model: string = process.env.EXPERT_OPENAI_MODEL ?? "gpt-4o-mini",
    private readonly baseUrl: string = process.env.EXPERT_OPENAI_BASE_URL ??
      "https://api.openai.com/v1",
  ) {}

  isAvailable(): boolean {
    return Boolean(this.apiKey);
  }

  async complete(input: CompletionInput): Promise<CompletionOutput> {
    if (!this.apiKey) {
      throw new Error("OpenAI provider is not configured");
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        temperature: input.temperature ?? 0.2,
        max_tokens: input.maxTokens ?? 800,
        messages: input.messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI error: ${response.status}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { total_tokens?: number };
    };

    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("OpenAI returned empty content");
    }

    return {
      content,
      model: this.model,
      providerId: this.id,
      tokenEstimate: payload.usage?.total_tokens,
    };
  }
}
