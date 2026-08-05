export const KNOWLEDGE_DOMAINS = [
  "products",
  "dilutions",
  "datasheets",
  "safety_sheets",
  "compatibilities",
  "cleaning_processes",
  "passport",
  "qr",
  "academy",
  "faq",
  "general_pergon",
] as const;
export type KnowledgeDomain = (typeof KNOWLEDGE_DOMAINS)[number];

export const KNOWLEDGE_STATUSES = ["draft", "published", "archived"] as const;
export type KnowledgeStatus = (typeof KNOWLEDGE_STATUSES)[number];

export const CONVERSATION_CHANNELS = ["web", "admin", "api"] as const;
export type ConversationChannel = (typeof CONVERSATION_CHANNELS)[number];

export const CONVERSATION_STATUSES = ["open", "closed", "escalated"] as const;
export type ConversationStatus = (typeof CONVERSATION_STATUSES)[number];

export const MESSAGE_ROLES = ["system", "user", "assistant", "tool"] as const;
export type MessageRole = (typeof MESSAGE_ROLES)[number];

export const FEEDBACK_RATINGS = ["up", "down"] as const;
export type FeedbackRating = (typeof FEEDBACK_RATINGS)[number];

export const ASK_OUTCOMES = [
  "answered",
  "insufficient_knowledge",
  "out_of_domain",
  "rate_limited",
  "error",
] as const;
export type AskOutcome = (typeof ASK_OUTCOMES)[number];
