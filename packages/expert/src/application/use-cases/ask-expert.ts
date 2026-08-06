import { formatZodError } from "@pergon/shared/i18n";
import { randomUUID } from "node:crypto";

import type { ConversationRecord, MessageCitation, MessageRecord } from "../../domain/models";
import {
  ExpertNotFoundError,
  ExpertRateLimitedError,
  ExpertValidationError,
} from "../../domain/errors";
import { formatSessionContext, looksOutOfDomain } from "../../knowledge/domain-guard";
import {
  EXPERT_SYSTEM_PROMPT,
  INSUFFICIENT_KNOWLEDGE_REPLY,
  OUT_OF_DOMAIN_REPLY,
} from "../../knowledge/system-prompt";
import type { ProviderRegistry } from "../../providers";
import { retrieveChunks } from "../../rag/retriever";
import { askExpertSchema } from "../../validation/schemas";
import type { AskExpertInput, AskExpertResult, ExpertUnitOfWork } from "../ports";

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

async function ensureConversation(
  uow: ExpertUnitOfWork,
  input: {
    conversationId?: string;
    organizationId?: string;
    userId?: string;
    anonymousKey?: string;
    channel: ConversationRecord["channel"];
    productSlug?: string;
    passportId?: string;
    qrCode?: string;
  },
): Promise<ConversationRecord> {
  const now = new Date().toISOString();

  if (input.conversationId) {
    const existing = await uow.conversations.findById(input.conversationId);
    if (!existing) throw new ExpertNotFoundError("Conversation not found");
    if (existing.status === "closed") {
      throw new ExpertValidationError("La conversación está cerrada.");
    }
    existing.contextProductSlug = input.productSlug ?? existing.contextProductSlug;
    existing.contextPassportId = input.passportId ?? existing.contextPassportId;
    existing.contextQrCode = input.qrCode ?? existing.contextQrCode;
    existing.updatedAt = now;
    await uow.conversations.save(existing);
    return existing;
  }

  const conversation: ConversationRecord = {
    id: randomUUID(),
    organizationId: input.organizationId,
    userId: input.userId,
    anonymousKey: input.anonymousKey,
    channel: input.channel,
    status: "open",
    contextProductSlug: input.productSlug,
    contextPassportId: input.passportId,
    contextQrCode: input.qrCode,
    context: {},
    messageCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  await uow.conversations.save(conversation);
  return conversation;
}

async function assertAndIncrementUsage(
  uow: ExpertUnitOfWork,
  input: {
    userId?: string;
    anonymousKey?: string;
    organizationId?: string;
    dailyLimit: number;
  },
): Promise<number> {
  if (!input.userId && !input.anonymousKey) {
    throw new ExpertValidationError("Se requiere userId o anonymousKey para los límites de uso.");
  }

  const usageDate = todayUtc();
  const existing = await uow.usage.getDaily({
    usageDate,
    userId: input.userId,
    anonymousKey: input.anonymousKey,
  });

  const askCount = existing?.askCount ?? 0;
  if (askCount >= input.dailyLimit) {
    throw new ExpertRateLimitedError();
  }

  await uow.usage.save({
    id: existing?.id ?? randomUUID(),
    usageDate,
    organizationId: input.organizationId,
    userId: input.userId,
    anonymousKey: input.anonymousKey,
    askCount: askCount + 1,
    tokenEstimate: existing?.tokenEstimate ?? 0,
  });

  return input.dailyLimit - (askCount + 1);
}

export async function askExpert(
  uow: ExpertUnitOfWork,
  providers: ProviderRegistry,
  raw: AskExpertInput,
): Promise<AskExpertResult> {
  const parsed = askExpertSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ExpertValidationError(formatZodError(parsed.error));
  }

  const input = parsed.data;
  const remainingAsksToday = await assertAndIncrementUsage(uow, {
    userId: input.userId,
    anonymousKey: input.anonymousKey,
    organizationId: input.organizationId,
    dailyLimit: input.dailyLimit,
  });

  const conversation = await ensureConversation(uow, {
    conversationId: input.conversationId,
    organizationId: input.organizationId,
    userId: input.userId,
    anonymousKey: input.anonymousKey,
    channel: input.channel,
    productSlug: input.productSlug,
    passportId: input.passportId,
    qrCode: input.qrCode,
  });

  const now = new Date().toISOString();
  const userMessage: MessageRecord = {
    id: randomUUID(),
    conversationId: conversation.id,
    role: "user",
    content: input.message,
    citations: [],
    retrievalIds: [],
    createdAt: now,
  };
  await uow.messages.save(userMessage);

  const outOfDomain = looksOutOfDomain(input.message);
  const documents = await uow.documents.listPublished(input.organizationId);
  const chunks = await uow.chunks.listPublishedChunks(input.organizationId);
  const documentsById = new Map(documents.map((d) => [d.id, { title: d.title, domain: d.domain }]));
  const hits = retrieveChunks(input.message, chunks, documentsById, 6);

  let outcome: AskExpertResult["outcome"] = "answered";
  let answer = "";
  let citations: MessageCitation[] = [];
  let providerId: string | null = null;
  let model: string | undefined;
  let refusalReason: string | undefined;
  let retrievalIds: string[] = [];

  if (outOfDomain) {
    outcome = "out_of_domain";
    answer = OUT_OF_DOMAIN_REPLY;
    refusalReason = "out_of_domain";
  } else if (hits.length === 0) {
    const greeting =
      input.message.trim().length < 40 &&
      /^(hola|buenas|hello|hi|hey)\b/i.test(input.message.trim());
    if (greeting) {
      outcome = "answered";
      answer =
        "Soy PerGon Expert, ingeniero técnico digital de PerGon. Puedo ayudar con productos, diluciones, fichas técnicas, hojas de seguridad, compatibilidades, procesos de limpieza, Pasaporte Digital, QR y Academia — únicamente con información publicada en la base de conocimiento. ¿Sobre qué tema PerGon necesita orientación?";
    } else {
      outcome = "insufficient_knowledge";
      answer = INSUFFICIENT_KNOWLEDGE_REPLY;
      refusalReason = "insufficient_knowledge";
    }
  } else {
    citations = hits.map((hit) => ({
      documentId: hit.chunk.documentId,
      chunkId: hit.chunk.id,
      title: hit.title,
      domain: hit.domain as MessageCitation["domain"],
    }));
    retrievalIds = hits.map((h) => h.chunk.id);

    const retrievalBlock = hits
      .map(
        (hit, index) =>
          `[fuente:${index + 1} title="${hit.title}" domain="${hit.domain}"]\n${hit.chunk.content}`,
      )
      .join("\n\n");

    const sessionContext = formatSessionContext({
      productSlug: conversation.contextProductSlug,
      passportId: conversation.contextPassportId,
      qrCode: conversation.contextQrCode,
    });

    const provider = providers.resolve();
    providerId = provider.id;

    try {
      const completion = await provider.complete({
        temperature: 0.2,
        maxTokens: 800,
        messages: [
          { role: "system", content: EXPERT_SYSTEM_PROMPT },
          {
            role: "system",
            content: `${sessionContext}\n\nContexto recuperado (única fuente factual permitida):\n${retrievalBlock}`,
          },
          { role: "user", content: input.message },
        ],
      });
      answer = completion.content;
      model = completion.model;
      providerId = completion.providerId;
    } catch {
      outcome = "error";
      answer =
        "No pude completar la respuesta con el proveedor de IA configurado. Intente de nuevo o escale a soporte humano.";
      refusalReason = "provider_error";
      providerId = provider.id;
    }
  }

  const assistantMessage: MessageRecord = {
    id: randomUUID(),
    conversationId: conversation.id,
    role: "assistant",
    content: answer,
    citations,
    providerId: providerId ?? undefined,
    model,
    retrievalIds,
    refusalReason,
    createdAt: new Date().toISOString(),
  };
  await uow.messages.save(assistantMessage);

  conversation.messageCount += 2;
  conversation.updatedAt = assistantMessage.createdAt;
  await uow.conversations.save(conversation);
  await uow.commit();

  return {
    outcome,
    conversationId: conversation.id,
    userMessageId: userMessage.id,
    assistantMessageId: assistantMessage.id,
    answer,
    citations,
    providerId,
    remainingAsksToday,
  };
}
