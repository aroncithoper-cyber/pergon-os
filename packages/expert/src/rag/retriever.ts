import { randomUUID } from "node:crypto";

import type { KnowledgeChunkRecord, KnowledgeDocumentRecord } from "../domain/models";

const DEFAULT_CHUNK_SIZE = 700;

export function chunkDocumentBody(
  document: KnowledgeDocumentRecord,
  chunkSize = DEFAULT_CHUNK_SIZE,
): Omit<KnowledgeChunkRecord, "id" | "createdAt">[] {
  const text = document.body.trim();
  if (!text) return [];

  const parts: string[] = [];
  let cursor = 0;
  while (cursor < text.length) {
    const end = Math.min(cursor + chunkSize, text.length);
    parts.push(text.slice(cursor, end).trim());
    cursor = end;
  }

  return parts.filter(Boolean).map((content, chunkIndex) => ({
    organizationId: document.organizationId,
    documentId: document.id,
    chunkIndex,
    content,
    tokenEstimate: Math.ceil(content.length / 4),
    metadata: {
      domain: document.domain,
      title: document.title,
      slug: document.slug,
    },
  }));
}

export function createChunkRecords(
  document: KnowledgeDocumentRecord,
  now = new Date().toISOString(),
): KnowledgeChunkRecord[] {
  return chunkDocumentBody(document).map((chunk) => ({
    ...chunk,
    id: randomUUID(),
    createdAt: now,
  }));
}

export type RetrievalHit = {
  chunk: KnowledgeChunkRecord;
  score: number;
  title: string;
  domain: string;
};

/** Lexical retriever prepared for vector swap-in (embedding_json). */
export function scoreChunk(query: string, content: string): number {
  const q = query
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .split(/[^a-z0-9áéíóúñü]+/i)
    .filter((t) => t.length > 2);
  if (q.length === 0) return 0;
  const hay = content.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  let hits = 0;
  for (const term of q) {
    if (hay.includes(term)) hits += 1;
  }
  return hits / q.length;
}

export function retrieveChunks(
  query: string,
  chunks: KnowledgeChunkRecord[],
  documentsById: Map<string, { title: string; domain: string }>,
  limit = 6,
): RetrievalHit[] {
  return chunks
    .map((chunk) => {
      const doc = documentsById.get(chunk.documentId);
      return {
        chunk,
        score: scoreChunk(query, chunk.content),
        title: doc?.title ?? "Documento",
        domain: doc?.domain ?? "general_pergon",
      };
    })
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
