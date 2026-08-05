import { AnthropicProvider } from "./anthropic-provider";
import { OpenAiProvider } from "./openai-provider";
import { StubAiProvider } from "./stub-provider";
import type { AiProvider } from "./types";

export type ProviderRegistryOptions = {
  preferred?: string;
  providers?: AiProvider[];
};

/**
 * Multi-provider abstraction: never hard-depend on a single vendor.
 * Order: preferred → available cloud providers → stub.
 */
export function createProviderRegistry(options: ProviderRegistryOptions = {}) {
  const providers =
    options.providers ??
    ([new OpenAiProvider(), new AnthropicProvider(), new StubAiProvider()] as AiProvider[]);

  const preferred =
    options.preferred ?? process.env.EXPERT_AI_PROVIDER ?? process.env.AI_PROVIDER ?? undefined;

  function list(): AiProvider[] {
    return providers;
  }

  function resolve(): AiProvider {
    if (preferred) {
      const match = providers.find((p) => p.id === preferred && p.isAvailable());
      if (match) return match;
    }

    const available = providers.find((p) => p.id !== "stub" && p.isAvailable());
    if (available) return available;

    const stub = providers.find((p) => p.id === "stub") ?? new StubAiProvider();
    return stub;
  }

  return { list, resolve };
}

export type ProviderRegistry = ReturnType<typeof createProviderRegistry>;

export * from "./types";
export { StubAiProvider } from "./stub-provider";
export { OpenAiProvider } from "./openai-provider";
export { AnthropicProvider } from "./anthropic-provider";
