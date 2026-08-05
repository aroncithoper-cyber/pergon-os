import type { AiProvider, CompletionInput, CompletionOutput } from "./types";
import { INSUFFICIENT_KNOWLEDGE_REPLY } from "../knowledge/system-prompt";

/** Deterministic offline provider — never invents domain facts. */
export class StubAiProvider implements AiProvider {
  readonly id = "stub";
  readonly displayName = "PerGon Stub Provider";

  isAvailable(): boolean {
    return true;
  }

  async complete(input: CompletionInput): Promise<CompletionOutput> {
    const joined = input.messages.map((m) => m.content).join("\n");
    const hasRetrieval = /\[fuente:/i.test(joined) || /contexto recuperado/i.test(joined);

    const content = hasRetrieval
      ? "Con la información recuperada de la base PerGon, respondo solo lo respaldado por esas fuentes. Si necesita más detalle técnico, indique producto, dilución o documento concreto."
      : INSUFFICIENT_KNOWLEDGE_REPLY;

    return {
      content,
      model: "stub-v1",
      providerId: this.id,
      tokenEstimate: Math.ceil(content.length / 4),
    };
  }
}
