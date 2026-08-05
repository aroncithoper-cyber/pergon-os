import type { AiProvider, CompletionInput, CompletionOutput } from "./types";

/**
 * Anthropic Messages API adapter.
 * Activated only when EXPERT_ANTHROPIC_API_KEY (or ANTHROPIC_API_KEY) is present.
 */
export class AnthropicProvider implements AiProvider {
  readonly id = "anthropic";
  readonly displayName = "Anthropic";

  constructor(
    private readonly apiKey: string | undefined = process.env.EXPERT_ANTHROPIC_API_KEY ??
      process.env.ANTHROPIC_API_KEY,
    private readonly model: string = process.env.EXPERT_ANTHROPIC_MODEL ??
      "claude-3-5-haiku-latest",
  ) {}

  isAvailable(): boolean {
    return Boolean(this.apiKey);
  }

  async complete(input: CompletionInput): Promise<CompletionOutput> {
    if (!this.apiKey) {
      throw new Error("Anthropic provider is not configured");
    }

    const system = input.messages
      .filter((m) => m.role === "system")
      .map((m) => m.content)
      .join("\n\n");
    const messages = input.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role, content: m.content }));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: input.maxTokens ?? 800,
        temperature: input.temperature ?? 0.2,
        system,
        messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic error: ${response.status}`);
    }

    const payload = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>;
      usage?: { input_tokens?: number; output_tokens?: number };
    };

    const content = payload.content
      ?.filter((part) => part.type === "text")
      .map((part) => part.text ?? "")
      .join("\n")
      .trim();

    if (!content) {
      throw new Error("Anthropic returned empty content");
    }

    return {
      content,
      model: this.model,
      providerId: this.id,
      tokenEstimate:
        payload.usage != null
          ? (payload.usage.input_tokens ?? 0) + (payload.usage.output_tokens ?? 0)
          : undefined,
    };
  }
}
