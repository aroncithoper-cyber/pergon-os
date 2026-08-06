import { formatZodError } from "@pergon/shared/i18n";
import { randomUUID } from "node:crypto";

import type { KnowledgeDocumentRecord } from "../../domain/models";
import { ExpertValidationError } from "../../domain/errors";
import { createChunkRecords } from "../../rag/retriever";
import { upsertKnowledgeSchema } from "../../validation/schemas";
import type { ExpertUnitOfWork, UpsertKnowledgeInput } from "../ports";

export async function upsertKnowledgeDocument(
  uow: ExpertUnitOfWork,
  raw: UpsertKnowledgeInput,
): Promise<KnowledgeDocumentRecord> {
  const parsed = upsertKnowledgeSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ExpertValidationError(formatZodError(parsed.error));
  }

  const input = parsed.data;
  const now = new Date().toISOString();
  const existing = input.id ? await uow.documents.findById(input.id) : null;

  const record: KnowledgeDocumentRecord = {
    id: existing?.id ?? input.id ?? randomUUID(),
    organizationId: input.organizationId,
    slug: input.slug.toLowerCase(),
    title: input.title,
    domain: input.domain,
    status: input.status ?? existing?.status ?? "draft",
    sourceType: input.sourceType ?? existing?.sourceType ?? "manual",
    sourceRef: input.sourceRef ?? existing?.sourceRef,
    body: input.body,
    metadata: input.metadata ?? existing?.metadata ?? {},
    publishedAt:
      (input.status ?? existing?.status) === "published"
        ? (existing?.publishedAt ?? now)
        : existing?.publishedAt,
    version: (existing?.version ?? 0) + 1,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    createdBy: existing?.createdBy ?? input.actorId,
    updatedBy: input.actorId,
    deletedAt: existing?.deletedAt,
  };

  if (record.status === "published" && !record.publishedAt) {
    record.publishedAt = now;
  }

  await uow.documents.save(record);
  const chunks = createChunkRecords(record, now);
  await uow.chunks.replaceForDocument(record.id, chunks);
  await uow.commit();
  return record;
}
