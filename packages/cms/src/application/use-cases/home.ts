import { createHash, randomUUID } from "node:crypto";

import { z } from "zod";

import { createDefaultHomePayload } from "../../domain/default-home";
import {
  CmsConflictError,
  CmsNotFoundError,
  CmsPreviewError,
  CmsValidationError,
} from "../../domain/errors";
import type {
  CmsHomeDocumentRecord,
  CmsHomePayload,
  CmsHomePreviewTokenRecord,
  CmsHomeVersionRecord,
} from "../../domain/models";
import { normalizeHomePayload } from "../../domain/normalize-home";
import { CMS_DEFAULT_ORGANIZATION_ID } from "../../domain/states";
import {
  getHomeSchema,
  homePayloadSchema,
  previewHomeSchema,
  publishHomeSchema,
  rollbackHomeSchema,
  saveHomeDraftSchema,
  scheduleHomeSchema,
} from "../../validation/schemas";
import type { CmsUnitOfWork } from "../ports";

function nowIso() {
  return new Date().toISOString();
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function previewSigningSecret() {
  return (
    process.env.CMS_PREVIEW_SECRET?.trim() ||
    process.env.CMS_REVALIDATE_SECRET?.trim() ||
    "pergon-cms-preview-dev"
  );
}

type SignedPreviewBody = {
  v: 1;
  exp: number;
  documentId: string;
  payload: CmsHomePayload;
};

function signPreviewToken(body: SignedPreviewBody): string {
  const payloadPart = Buffer.from(JSON.stringify(body), "utf8").toString("base64url");
  const sig = createHash("sha256")
    .update(`${payloadPart}.${previewSigningSecret()}`)
    .digest("base64url");
  return `pv1.${payloadPart}.${sig}`;
}

function verifySignedPreviewToken(token: string): SignedPreviewBody | null {
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "pv1") return null;
  const payloadPart = parts[1];
  const sig = parts[2];
  if (!payloadPart || !sig) return null;
  const expected = createHash("sha256")
    .update(`${payloadPart}.${previewSigningSecret()}`)
    .digest("base64url");
  if (sig !== expected) return null;
  try {
    const body = JSON.parse(
      Buffer.from(payloadPart, "base64url").toString("utf8"),
    ) as SignedPreviewBody;
    if (body.v !== 1 || typeof body.exp !== "number" || !body.payload) return null;
    if (body.exp < Date.now()) return null;
    return body;
  } catch {
    return null;
  }
}

function parseOrThrow<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new CmsValidationError(
      result.error.issues.map((i) => i.message).join("; ") || "Invalid input",
    );
  }
  return result.data;
}

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === "object" ? (input as Record<string, unknown>) : {};
}

function withHomeDefaults(input: unknown, extras: Record<string, unknown> = {}) {
  const raw = asRecord(input);
  return {
    ...raw,
    locale: typeof raw.locale === "string" ? raw.locale : "es",
    ...extras,
  };
}

function normalizeDocument(doc: CmsHomeDocumentRecord): CmsHomeDocumentRecord {
  return {
    ...doc,
    workingPayload: normalizeHomePayload(doc.workingPayload),
    publishedPayload: doc.publishedPayload ? normalizeHomePayload(doc.publishedPayload) : undefined,
  };
}

export async function ensureHomeDocument(
  uow: CmsUnitOfWork,
  organizationId: string,
  locale: string,
  actorId?: string,
): Promise<CmsHomeDocumentRecord> {
  const existing = await uow.homeDocuments.findByOrgLocale(organizationId, locale);
  if (existing) return normalizeDocument(existing);

  const ts = nowIso();
  const payload = normalizeHomePayload(createDefaultHomePayload(locale));
  const record: CmsHomeDocumentRecord = {
    id: randomUUID(),
    organizationId,
    locale,
    status: "draft",
    workingPayload: payload,
    publishedPayload: undefined,
    publishedVersion: 0,
    workingVersion: 1,
    metadata: {},
    createdAt: ts,
    updatedAt: ts,
    createdBy: actorId,
    updatedBy: actorId,
  };
  await uow.homeDocuments.save(record);
  return record;
}

export async function getHomeDocument(
  uow: CmsUnitOfWork,
  input: unknown,
): Promise<CmsHomeDocumentRecord> {
  const data = parseOrThrow(getHomeSchema, withHomeDefaults(input));
  const organizationId = data.organizationId ?? CMS_DEFAULT_ORGANIZATION_ID;
  return ensureHomeDocument(uow, organizationId, data.locale);
}

export async function saveHomeDraft(
  uow: CmsUnitOfWork,
  input: unknown,
): Promise<CmsHomeDocumentRecord> {
  const data = parseOrThrow(saveHomeDraftSchema, withHomeDefaults(input));
  const payload = normalizeHomePayload(homePayloadSchema.parse(data.payload) as CmsHomePayload);
  const doc = await ensureHomeDocument(uow, data.organizationId, data.locale, data.actorId);

  if (
    data.expectedWorkingVersion !== undefined &&
    data.expectedWorkingVersion !== doc.workingVersion
  ) {
    throw new CmsConflictError(
      `Working version mismatch: expected ${data.expectedWorkingVersion}, got ${doc.workingVersion}`,
    );
  }

  const updated: CmsHomeDocumentRecord = {
    ...doc,
    workingPayload: { ...payload, locale: data.locale },
    workingVersion: doc.workingVersion + 1,
    status: doc.status === "published" || doc.status === "scheduled" ? doc.status : "draft",
    updatedAt: nowIso(),
    updatedBy: data.actorId,
  };
  await uow.homeDocuments.save(updated);
  return updated;
}

export async function publishHome(
  uow: CmsUnitOfWork,
  input: unknown,
): Promise<{ document: CmsHomeDocumentRecord; version: CmsHomeVersionRecord }> {
  const data = parseOrThrow(publishHomeSchema, withHomeDefaults(input));
  const doc = await ensureHomeDocument(uow, data.organizationId, data.locale, data.actorId);
  const ts = nowIso();
  const nextVersion = doc.publishedVersion + 1;

  const version: CmsHomeVersionRecord = {
    id: randomUUID(),
    documentId: doc.id,
    organizationId: doc.organizationId,
    versionNumber: nextVersion,
    kind: "publish",
    payload: structuredClone(doc.workingPayload),
    note: data.note,
    createdAt: ts,
    createdBy: data.actorId,
  };
  await uow.homeVersions.save(version);

  const updated: CmsHomeDocumentRecord = {
    ...doc,
    status: "published",
    publishedPayload: structuredClone(doc.workingPayload),
    publishedVersion: nextVersion,
    publishAt: undefined,
    lastPublishedAt: ts,
    lastPublishedBy: data.actorId,
    updatedAt: ts,
    updatedBy: data.actorId,
  };
  await uow.homeDocuments.save(updated);
  return { document: updated, version };
}

export async function scheduleHome(
  uow: CmsUnitOfWork,
  input: unknown,
): Promise<CmsHomeDocumentRecord> {
  const data = parseOrThrow(scheduleHomeSchema, withHomeDefaults(input));
  const doc = await ensureHomeDocument(uow, data.organizationId, data.locale, data.actorId);
  const publishAt = data.publishAt ?? undefined;
  const unpublishAt = data.unpublishAt ?? undefined;

  if (publishAt && unpublishAt && new Date(unpublishAt) <= new Date(publishAt)) {
    throw new CmsValidationError("unpublishAt must be after publishAt");
  }

  const now = Date.now();
  let status = doc.status;
  if (publishAt && new Date(publishAt).getTime() > now) {
    status = "scheduled";
  } else if (publishAt && new Date(publishAt).getTime() <= now) {
    status = "published";
  }

  const updated: CmsHomeDocumentRecord = {
    ...doc,
    publishAt,
    unpublishAt,
    status:
      status === "published"
        ? "published"
        : publishAt
          ? "scheduled"
          : doc.status === "published"
            ? "published"
            : "draft",
    publishedPayload:
      status === "published" ? structuredClone(doc.workingPayload) : doc.publishedPayload,
    updatedAt: nowIso(),
    updatedBy: data.actorId,
  };

  if (status === "published" && !doc.publishedPayload) {
    const published = await publishHome(uow, {
      organizationId: data.organizationId,
      locale: data.locale,
      note: "Auto-publish from schedule",
      actorId: data.actorId,
    });
    return {
      ...published.document,
      publishAt,
      unpublishAt,
    };
  }

  await uow.homeDocuments.save(updated);
  return updated;
}

export async function createPreviewToken(
  uow: CmsUnitOfWork,
  input: unknown,
): Promise<{ token: string; expiresAt: string; previewPath: string }> {
  const raw = asRecord(input);
  const data = parseOrThrow(
    previewHomeSchema,
    withHomeDefaults(input, {
      ttlSeconds: typeof raw.ttlSeconds === "number" ? raw.ttlSeconds : 1800,
    }),
  );
  const doc = await ensureHomeDocument(uow, data.organizationId, data.locale, data.actorId);

  let payload = doc.workingPayload;
  if (data.versionId) {
    const version = await uow.homeVersions.findById(data.versionId);
    if (!version || version.documentId !== doc.id) {
      throw new CmsNotFoundError("Version not found");
    }
    payload = version.payload;
  }

  const expiresAtMs = Date.now() + data.ttlSeconds * 1000;
  const expiresAt = new Date(expiresAtMs).toISOString();
  const token = signPreviewToken({
    v: 1,
    exp: expiresAtMs,
    documentId: doc.id,
    payload: structuredClone(payload),
  });

  const record: CmsHomePreviewTokenRecord = {
    id: randomUUID(),
    documentId: doc.id,
    organizationId: doc.organizationId,
    tokenHash: hashToken(token),
    expiresAt,
    source: data.versionId ? "version" : "working",
    versionId: data.versionId,
    createdAt: nowIso(),
    createdBy: data.actorId,
  };
  await uow.homePreviewTokens.save(record);

  return {
    token,
    expiresAt,
    previewPath: `/preview/home?token=${encodeURIComponent(token)}`,
  };
}

export async function getPreviewHome(
  uow: CmsUnitOfWork,
  token: string,
): Promise<{ payload: CmsHomePayload; documentId: string; expiresAt: string }> {
  if (!token?.trim()) throw new CmsPreviewError("Missing preview token");
  const trimmed = token.trim();

  const signed = verifySignedPreviewToken(trimmed);
  if (signed) {
    return {
      payload: signed.payload,
      documentId: signed.documentId,
      expiresAt: new Date(signed.exp).toISOString(),
    };
  }

  const record = await uow.homePreviewTokens.findByTokenHash(hashToken(trimmed));
  if (!record || record.revokedAt) throw new CmsPreviewError("Invalid preview token");
  if (new Date(record.expiresAt).getTime() < Date.now()) {
    throw new CmsPreviewError("Preview token expired");
  }

  const exact = await uow.homeDocuments.findById(record.documentId);
  if (!exact) throw new CmsPreviewError("Preview document missing");

  if (record.source === "version" && record.versionId) {
    const version = await uow.homeVersions.findById(record.versionId);
    if (!version) throw new CmsPreviewError("Preview version missing");
    return {
      payload: normalizeHomePayload(version.payload),
      documentId: exact.id,
      expiresAt: record.expiresAt,
    };
  }

  return {
    payload: normalizeHomePayload(exact.workingPayload),
    documentId: exact.id,
    expiresAt: record.expiresAt,
  };
}

export async function getPublishedHome(
  uow: CmsUnitOfWork,
  input: unknown,
): Promise<CmsHomePayload | null> {
  const data = parseOrThrow(getHomeSchema, withHomeDefaults(input));
  if (data.organizationId) {
    const doc = await uow.homeDocuments.findByOrgLocale(data.organizationId, data.locale);
    if (!doc || doc.status !== "published" || !doc.publishedPayload) return null;
    if (doc.unpublishAt && new Date(doc.unpublishAt).getTime() <= Date.now()) return null;
    return normalizeHomePayload(doc.publishedPayload);
  }
  const doc = await uow.homeDocuments.findPublishedByLocale(data.locale);
  if (!doc?.publishedPayload) return null;
  if (doc.unpublishAt && new Date(doc.unpublishAt).getTime() <= Date.now()) return null;
  return normalizeHomePayload(doc.publishedPayload);
}

export async function listHomeVersions(uow: CmsUnitOfWork, input: unknown) {
  const data = parseOrThrow(getHomeSchema, withHomeDefaults(input));
  const organizationId = data.organizationId ?? CMS_DEFAULT_ORGANIZATION_ID;
  const doc = await ensureHomeDocument(uow, organizationId, data.locale);
  return uow.homeVersions.listByDocument(doc.id);
}

export async function rollbackHome(
  uow: CmsUnitOfWork,
  input: unknown,
): Promise<{ document: CmsHomeDocumentRecord; version?: CmsHomeVersionRecord }> {
  const raw = asRecord(input);
  const data = parseOrThrow(
    rollbackHomeSchema,
    withHomeDefaults(input, {
      publish: raw.publish !== false,
    }),
  );
  const doc = await ensureHomeDocument(uow, data.organizationId, data.locale, data.actorId);
  const target = await uow.homeVersions.findById(data.versionId);
  if (!target || target.documentId !== doc.id) {
    throw new CmsNotFoundError("Version not found");
  }

  const ts = nowIso();
  let updated: CmsHomeDocumentRecord = {
    ...doc,
    workingPayload: structuredClone(target.payload),
    workingVersion: doc.workingVersion + 1,
    updatedAt: ts,
    updatedBy: data.actorId,
  };
  await uow.homeDocuments.save(updated);

  if (!data.publish) {
    return { document: updated };
  }

  const nextVersion = updated.publishedVersion + 1;
  const version: CmsHomeVersionRecord = {
    id: randomUUID(),
    documentId: updated.id,
    organizationId: updated.organizationId,
    versionNumber: nextVersion,
    kind: "rollback",
    payload: structuredClone(target.payload),
    note: data.note ?? `Rollback to v${target.versionNumber}`,
    createdAt: ts,
    createdBy: data.actorId,
  };
  await uow.homeVersions.save(version);

  updated = {
    ...updated,
    status: "published",
    publishedPayload: structuredClone(target.payload),
    publishedVersion: nextVersion,
    lastPublishedAt: ts,
    lastPublishedBy: data.actorId,
    updatedAt: ts,
  };
  await uow.homeDocuments.save(updated);
  return { document: updated, version };
}

export async function drainHomeSchedule(uow: CmsUnitOfWork, actorId?: string) {
  const now = nowIso();
  const duePublish = await uow.homeDocuments.listScheduledDue(now);
  const dueUnpublish = await uow.homeDocuments.listUnpublishDue(now);
  const published: string[] = [];
  const unpublished: string[] = [];

  for (const doc of duePublish) {
    const result = await publishHome(uow, {
      organizationId: doc.organizationId,
      locale: doc.locale,
      note: "Scheduled publish",
      actorId,
    });
    await uow.homeDocuments.save({
      ...result.document,
      publishAt: undefined,
      unpublishAt: doc.unpublishAt,
    });
    published.push(result.document.id);
  }

  for (const doc of dueUnpublish) {
    const updated: CmsHomeDocumentRecord = {
      ...doc,
      status: "expired",
      publishedPayload: undefined,
      unpublishAt: undefined,
      updatedAt: now,
      updatedBy: actorId,
    };
    await uow.homeDocuments.save(updated);
    unpublished.push(doc.id);
  }

  return { published, unpublished, at: now };
}
