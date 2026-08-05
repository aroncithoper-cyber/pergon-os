import { askExpert } from "./use-cases/ask-expert";
import { escalateSupport, getConversation, submitFeedback } from "./use-cases/conversation-ops";
import { upsertKnowledgeDocument } from "./use-cases/upsert-knowledge";
import type { ExpertUnitOfWork } from "./ports";
import { createProviderRegistry, type ProviderRegistry } from "../providers";

export function createExpertServices(
  uow: ExpertUnitOfWork,
  providers: ProviderRegistry = createProviderRegistry(),
) {
  return {
    askExpert: (input: Parameters<typeof askExpert>[2]) => askExpert(uow, providers, input),
    upsertKnowledgeDocument: (input: Parameters<typeof upsertKnowledgeDocument>[1]) =>
      upsertKnowledgeDocument(uow, input),
    submitFeedback: (input: Parameters<typeof submitFeedback>[1]) => submitFeedback(uow, input),
    escalateSupport: (input: Parameters<typeof escalateSupport>[1]) => escalateSupport(uow, input),
    getConversation: (
      conversationId: string,
      access?: { anonymousKey?: string; userId?: string },
    ) => getConversation(uow, conversationId, access),
    listProviders: () =>
      providers.list().map((p) => ({
        id: p.id,
        displayName: p.displayName,
        available: p.isAvailable(),
      })),
  };
}

export type ExpertServices = ReturnType<typeof createExpertServices>;

export * from "./ports";
export { askExpert } from "./use-cases/ask-expert";
export { upsertKnowledgeDocument } from "./use-cases/upsert-knowledge";
export { escalateSupport, getConversation, submitFeedback } from "./use-cases/conversation-ops";
