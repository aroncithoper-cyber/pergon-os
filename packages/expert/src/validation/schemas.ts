import { z } from "zod";

import { FEEDBACK_RATINGS, KNOWLEDGE_DOMAINS, KNOWLEDGE_STATUSES } from "../domain/states";

export const askExpertSchema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().uuid().optional(),
  organizationId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  anonymousKey: z.string().min(8).max(128).optional(),
  channel: z.enum(["web", "admin", "api"]).optional().default("web"),
  productSlug: z.string().max(120).optional(),
  passportId: z.string().max(64).optional(),
  qrCode: z.string().max(64).optional(),
  dailyLimit: z.number().int().min(1).max(500).optional().default(30),
});

export const upsertKnowledgeSchema = z.object({
  organizationId: z.string().uuid(),
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i),
  title: z.string().min(1).max(200),
  domain: z.enum(KNOWLEDGE_DOMAINS),
  body: z.string().min(1).max(100_000),
  status: z.enum(KNOWLEDGE_STATUSES).optional(),
  sourceType: z.enum(["manual", "catalog", "passport", "academy", "upload", "system"]).optional(),
  sourceRef: z.string().max(200).optional(),
  metadata: z.record(z.unknown()).optional(),
  actorId: z.string().uuid().optional(),
});

export const submitFeedbackSchema = z.object({
  conversationId: z.string().uuid(),
  messageId: z.string().uuid(),
  rating: z.enum(FEEDBACK_RATINGS),
  comment: z.string().max(1000).optional(),
  userId: z.string().uuid().optional(),
  anonymousKey: z.string().min(8).max(128).optional(),
});

export const escalateSupportSchema = z.object({
  conversationId: z.string().uuid(),
  reason: z.string().min(3).max(1000),
  organizationId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  anonymousKey: z.string().min(8).max(128).optional(),
  metadata: z.record(z.unknown()).optional(),
});
