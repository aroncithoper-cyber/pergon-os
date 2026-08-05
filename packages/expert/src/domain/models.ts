import type {
  AskOutcome,
  ConversationChannel,
  ConversationStatus,
  FeedbackRating,
  KnowledgeDomain,
  KnowledgeStatus,
  MessageRole,
} from "./states";

export type EntityId = string;

export type KnowledgeDocumentRecord = {
  id: EntityId;
  organizationId: EntityId;
  slug: string;
  title: string;
  domain: KnowledgeDomain;
  status: KnowledgeStatus;
  sourceType: "manual" | "catalog" | "passport" | "academy" | "upload" | "system";
  sourceRef?: string;
  body: string;
  metadata: Record<string, unknown>;
  publishedAt?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: EntityId;
  updatedBy?: EntityId;
  deletedAt?: string;
};

export type KnowledgeChunkRecord = {
  id: EntityId;
  organizationId: EntityId;
  documentId: EntityId;
  chunkIndex: number;
  content: string;
  tokenEstimate?: number;
  embeddingJson?: number[];
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type ConversationRecord = {
  id: EntityId;
  organizationId?: EntityId;
  userId?: EntityId;
  anonymousKey?: string;
  channel: ConversationChannel;
  status: ConversationStatus;
  title?: string;
  contextProductSlug?: string;
  contextPassportId?: string;
  contextQrCode?: string;
  context: Record<string, unknown>;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
};

export type MessageCitation = {
  documentId: string;
  chunkId: string;
  title: string;
  domain: KnowledgeDomain;
};

export type MessageRecord = {
  id: EntityId;
  conversationId: EntityId;
  role: MessageRole;
  content: string;
  citations: MessageCitation[];
  providerId?: string;
  model?: string;
  retrievalIds: string[];
  refusalReason?: string;
  createdAt: string;
};

export type FeedbackRecord = {
  id: EntityId;
  conversationId: EntityId;
  messageId: EntityId;
  rating: FeedbackRating;
  comment?: string;
  createdBy?: EntityId;
  anonymousKey?: string;
  createdAt: string;
};

export type EscalationRecord = {
  id: EntityId;
  conversationId: EntityId;
  organizationId?: EntityId;
  reason: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  createdBy?: EntityId;
  anonymousKey?: string;
  assignedTo?: EntityId;
  metadata: Record<string, unknown>;
  createdAt: string;
  resolvedAt?: string;
};

export type UsageDailyRecord = {
  id: EntityId;
  usageDate: string;
  organizationId?: EntityId;
  userId?: EntityId;
  anonymousKey?: string;
  askCount: number;
  tokenEstimate: number;
};

export type ExpertContext = {
  productSlug?: string;
  passportId?: string;
  qrCode?: string;
  extra?: Record<string, unknown>;
};

export type AskExpertResult = {
  outcome: AskOutcome;
  conversationId: string;
  userMessageId: string;
  assistantMessageId: string;
  answer: string;
  citations: MessageCitation[];
  providerId: string | null;
  remainingAsksToday: number;
};
