import { formatZodError } from "@pergon/shared/i18n";
import { randomUUID } from "node:crypto";

import { ExpertNotFoundError, ExpertValidationError } from "../../domain/errors";
import { escalateSupportSchema, submitFeedbackSchema } from "../../validation/schemas";
import type { EscalateSupportInput, ExpertUnitOfWork, SubmitFeedbackInput } from "../ports";

export async function submitFeedback(uow: ExpertUnitOfWork, raw: SubmitFeedbackInput) {
  const parsed = submitFeedbackSchema.safeParse(raw);
  if (!parsed.success) throw new ExpertValidationError(formatZodError(parsed.error));

  const input = parsed.data;
  const conversation = await uow.conversations.findById(input.conversationId);
  if (!conversation) throw new ExpertNotFoundError("No encontramos esa conversación.");

  const message = await uow.messages.findById(input.messageId);
  if (!message || message.conversationId !== input.conversationId) {
    throw new ExpertNotFoundError("No encontramos ese mensaje.");
  }

  const record = {
    id: randomUUID(),
    conversationId: input.conversationId,
    messageId: input.messageId,
    rating: input.rating,
    comment: input.comment,
    createdBy: input.userId,
    anonymousKey: input.anonymousKey,
    createdAt: new Date().toISOString(),
  };

  await uow.feedback.save(record);
  await uow.commit();
  return record;
}

export async function escalateSupport(uow: ExpertUnitOfWork, raw: EscalateSupportInput) {
  const parsed = escalateSupportSchema.safeParse(raw);
  if (!parsed.success) throw new ExpertValidationError(formatZodError(parsed.error));

  const input = parsed.data;
  const conversation = await uow.conversations.findById(input.conversationId);
  if (!conversation) throw new ExpertNotFoundError("No encontramos esa conversación.");

  const now = new Date().toISOString();
  conversation.status = "escalated";
  conversation.updatedAt = now;
  await uow.conversations.save(conversation);

  const escalation = {
    id: randomUUID(),
    conversationId: input.conversationId,
    organizationId: input.organizationId ?? conversation.organizationId,
    reason: input.reason,
    status: "open" as const,
    createdBy: input.userId,
    anonymousKey: input.anonymousKey,
    metadata: input.metadata ?? {},
    createdAt: now,
  };

  await uow.escalations.save(escalation);
  await uow.commit();
  return escalation;
}

export async function getConversation(
  uow: ExpertUnitOfWork,
  conversationId: string,
  access?: { anonymousKey?: string; userId?: string },
) {
  const conversation = await uow.conversations.findById(conversationId);
  if (!conversation) throw new ExpertNotFoundError("No encontramos esa conversación.");

  if (access?.anonymousKey || access?.userId) {
    const ownsByAnon =
      access.anonymousKey &&
      conversation.anonymousKey &&
      conversation.anonymousKey === access.anonymousKey;
    const ownsByUser =
      access.userId && conversation.userId && conversation.userId === access.userId;
    if (!ownsByAnon && !ownsByUser) {
      throw new ExpertNotFoundError("No encontramos esa conversación.");
    }
  }

  const messages = await uow.messages.listByConversationId(conversationId);
  return { conversation, messages };
}
