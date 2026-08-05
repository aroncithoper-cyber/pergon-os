import type {
  AskExpertResult,
  ConversationRecord,
  EscalationRecord,
  FeedbackRecord,
  KnowledgeChunkRecord,
  KnowledgeDocumentRecord,
  MessageRecord,
  UsageDailyRecord,
} from "../domain/models";
import type { ConversationChannel, FeedbackRating, KnowledgeDomain } from "../domain/states";

export type ExpertUnitOfWork = {
  documents: KnowledgeDocumentRepository;
  chunks: KnowledgeChunkRepository;
  conversations: ConversationRepository;
  messages: MessageRepository;
  feedback: FeedbackRepository;
  escalations: EscalationRepository;
  usage: UsageRepository;
  commit(): Promise<void>;
};

export interface KnowledgeDocumentRepository {
  findById(id: string): Promise<KnowledgeDocumentRecord | null>;
  findBySlug(organizationId: string, slug: string): Promise<KnowledgeDocumentRecord | null>;
  listPublished(organizationId?: string): Promise<KnowledgeDocumentRecord[]>;
  save(record: KnowledgeDocumentRecord): Promise<void>;
}

export interface KnowledgeChunkRepository {
  listByDocumentId(documentId: string): Promise<KnowledgeChunkRecord[]>;
  listPublishedChunks(organizationId?: string): Promise<KnowledgeChunkRecord[]>;
  replaceForDocument(documentId: string, chunks: KnowledgeChunkRecord[]): Promise<void>;
}

export interface ConversationRepository {
  findById(id: string): Promise<ConversationRecord | null>;
  save(record: ConversationRecord): Promise<void>;
}

export interface MessageRepository {
  listByConversationId(conversationId: string): Promise<MessageRecord[]>;
  save(record: MessageRecord): Promise<void>;
  findById(id: string): Promise<MessageRecord | null>;
}

export interface FeedbackRepository {
  save(record: FeedbackRecord): Promise<void>;
}

export interface EscalationRepository {
  save(record: EscalationRecord): Promise<void>;
}

export interface UsageRepository {
  getDaily(input: {
    usageDate: string;
    userId?: string;
    anonymousKey?: string;
  }): Promise<UsageDailyRecord | null>;
  save(record: UsageDailyRecord): Promise<void>;
}

export type AskExpertInput = {
  message: string;
  conversationId?: string;
  organizationId?: string;
  userId?: string;
  anonymousKey?: string;
  channel?: ConversationChannel;
  productSlug?: string;
  passportId?: string;
  qrCode?: string;
  dailyLimit?: number;
};

export type UpsertKnowledgeInput = {
  organizationId: string;
  id?: string;
  slug: string;
  title: string;
  domain: KnowledgeDomain;
  body: string;
  status?: KnowledgeDocumentRecord["status"];
  sourceType?: KnowledgeDocumentRecord["sourceType"];
  sourceRef?: string;
  metadata?: Record<string, unknown>;
  actorId?: string;
};

export type SubmitFeedbackInput = {
  conversationId: string;
  messageId: string;
  rating: FeedbackRating;
  comment?: string;
  userId?: string;
  anonymousKey?: string;
};

export type EscalateSupportInput = {
  conversationId: string;
  reason: string;
  organizationId?: string;
  userId?: string;
  anonymousKey?: string;
  metadata?: Record<string, unknown>;
};

export type { AskExpertResult };
