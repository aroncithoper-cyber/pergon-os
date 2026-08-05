import { randomUUID } from "node:crypto";

import type {
  ConversationRecord,
  EscalationRecord,
  FeedbackRecord,
  KnowledgeChunkRecord,
  KnowledgeDocumentRecord,
  MessageRecord,
  UsageDailyRecord,
} from "../../domain/models";
import type {
  ConversationRepository,
  EscalationRepository,
  ExpertUnitOfWork,
  FeedbackRepository,
  KnowledgeChunkRepository,
  KnowledgeDocumentRepository,
  MessageRepository,
  UsageRepository,
} from "../../application/ports";

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class ExpertMemoryStore {
  documents = new Map<string, KnowledgeDocumentRecord>();
  chunks = new Map<string, KnowledgeChunkRecord>();
  conversations = new Map<string, ConversationRecord>();
  messages = new Map<string, MessageRecord>();
  feedback = new Map<string, FeedbackRecord>();
  escalations = new Map<string, EscalationRecord>();
  usage = new Map<string, UsageDailyRecord>();
}

function usageKey(input: { usageDate: string; userId?: string; anonymousKey?: string }) {
  return `${input.usageDate}:${input.userId ?? ""}:${input.anonymousKey ?? ""}`;
}

export function createMemoryExpertUnitOfWork(store = new ExpertMemoryStore()): ExpertUnitOfWork {
  const documents: KnowledgeDocumentRepository = {
    async findById(id) {
      const row = store.documents.get(id);
      return row && !row.deletedAt ? clone(row) : null;
    },
    async findBySlug(organizationId, slug) {
      for (const row of store.documents.values()) {
        if (row.organizationId === organizationId && row.slug === slug && !row.deletedAt) {
          return clone(row);
        }
      }
      return null;
    },
    async listPublished(organizationId) {
      return [...store.documents.values()]
        .filter(
          (row) =>
            row.status === "published" &&
            !row.deletedAt &&
            (!organizationId || row.organizationId === organizationId),
        )
        .map(clone);
    },
    async save(record) {
      store.documents.set(record.id, clone(record));
    },
  };

  const chunks: KnowledgeChunkRepository = {
    async listByDocumentId(documentId) {
      return [...store.chunks.values()]
        .filter((c) => c.documentId === documentId)
        .sort((a, b) => a.chunkIndex - b.chunkIndex)
        .map(clone);
    },
    async listPublishedChunks(organizationId) {
      const publishedIds = new Set(
        [...store.documents.values()]
          .filter(
            (d) =>
              d.status === "published" &&
              !d.deletedAt &&
              (!organizationId || d.organizationId === organizationId),
          )
          .map((d) => d.id),
      );
      return [...store.chunks.values()].filter((c) => publishedIds.has(c.documentId)).map(clone);
    },
    async replaceForDocument(documentId, next) {
      for (const [id, chunk] of store.chunks) {
        if (chunk.documentId === documentId) store.chunks.delete(id);
      }
      for (const chunk of next) store.chunks.set(chunk.id, clone(chunk));
    },
  };

  const conversations: ConversationRepository = {
    async findById(id) {
      const row = store.conversations.get(id);
      return row ? clone(row) : null;
    },
    async save(record) {
      store.conversations.set(record.id, clone(record));
    },
  };

  const messages: MessageRepository = {
    async listByConversationId(conversationId) {
      return [...store.messages.values()]
        .filter((m) => m.conversationId === conversationId)
        .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
        .map(clone);
    },
    async save(record) {
      store.messages.set(record.id, clone(record));
    },
    async findById(id) {
      const row = store.messages.get(id);
      return row ? clone(row) : null;
    },
  };

  const feedback: FeedbackRepository = {
    async save(record) {
      store.feedback.set(record.id, clone(record));
    },
  };

  const escalations: EscalationRepository = {
    async save(record) {
      store.escalations.set(record.id, clone(record));
    },
  };

  const usage: UsageRepository = {
    async getDaily(input) {
      const row = store.usage.get(usageKey(input));
      return row ? clone(row) : null;
    },
    async save(record) {
      store.usage.set(
        usageKey({
          usageDate: record.usageDate,
          userId: record.userId,
          anonymousKey: record.anonymousKey,
        }),
        clone(record),
      );
    },
  };

  return {
    documents,
    chunks,
    conversations,
    messages,
    feedback,
    escalations,
    usage,
    async commit() {},
  };
}

export function createSharedMemoryExpertUnitOfWork(): ExpertUnitOfWork {
  const g = globalThis as { __pergonExpertStore?: ExpertMemoryStore };
  if (!g.__pergonExpertStore) {
    g.__pergonExpertStore = new ExpertMemoryStore();
  }
  return createMemoryExpertUnitOfWork(g.__pergonExpertStore);
}

export function newExpertId(): string {
  return randomUUID();
}
