import { CmsError } from "@pergon/cms";
import { createServiceClient, getStorageBucketClient } from "@pergon/database";
import { hasSupabaseServiceRole } from "@pergon/shared/env";

import { requireApiPermission, toAuthErrorResponse } from "@/lib/auth";
import { getCmsServices, toCmsErrorResponse } from "@/lib/cms";

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

function canReadMedia(perms: { has: (p: string) => boolean }) {
  return perms.has("cms.media:read") || perms.has("cms:read") || perms.has("cms:write");
}

function canWriteMedia(perms: { has: (p: string) => boolean }) {
  return perms.has("cms.media:write") || perms.has("cms:write");
}

function emptyToUndefined(value: string | null): string | undefined {
  const v = value?.trim();
  return v ? v : undefined;
}

export async function GET(request: Request) {
  try {
    const ctx = await requireApiPermission(request, "cms:read");
    if (!canReadMedia(ctx.permissions)) {
      return Response.json(
        { error: { code: "FORBIDDEN", message: "cms.media:read required" } },
        { status: 403 },
      );
    }
    const url = new URL(request.url);
    const limitRaw = Number(url.searchParams.get("limit") ?? 50);
    const offsetRaw = Number(url.searchParams.get("offset") ?? 0);
    const data = await getCmsServices().listMediaAssets({
      organizationId: ctx.organizationId,
      search: emptyToUndefined(url.searchParams.get("search")),
      kind: emptyToUndefined(url.searchParams.get("kind")),
      videoProvider: emptyToUndefined(url.searchParams.get("videoProvider")),
      logoVariant: emptyToUndefined(url.searchParams.get("logoVariant")),
      category: emptyToUndefined(url.searchParams.get("category")),
      tag: emptyToUndefined(url.searchParams.get("tag")),
      favoritesOnly: url.searchParams.get("favoritesOnly") === "1",
      sort: emptyToUndefined(url.searchParams.get("sort")) ?? "updated_desc",
      limit: Number.isFinite(limitRaw) ? limitRaw : 50,
      offset: Number.isFinite(offsetRaw) ? offsetRaw : 0,
    });
    return Response.json({ data });
  } catch (error) {
    if (error instanceof CmsError) return toCmsErrorResponse(error);
    return toAuthErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireApiPermission(request, "cms:write");
    if (!canWriteMedia(ctx.permissions)) {
      return Response.json(
        { error: { code: "FORBIDDEN", message: "cms.media:write required" } },
        { status: 403 },
      );
    }
    const body = (await request.json()) as Record<string, unknown>;
    const data = await getCmsServices().createMediaAsset({
      ...body,
      organizationId: String(body.organizationId ?? ctx.organizationId),
      actorId: ctx.userId,
    });
    return Response.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof CmsError) return toCmsErrorResponse(error);
    return toAuthErrorResponse(error);
  }
}

/** Simple binary upload for image/poster/document/logo — not for video. */
export async function PUT(request: Request) {
  try {
    const ctx = await requireApiPermission(request, "cms:write");
    if (!canWriteMedia(ctx.permissions)) {
      return Response.json(
        { error: { code: "FORBIDDEN", message: "cms.media:write required" } },
        { status: 403 },
      );
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return Response.json(
        { error: { code: "VALIDATION_FAILED", message: "file required" } },
        { status: 400 },
      );
    }

    const kind = String(form.get("kind") ?? "image");
    if (kind === "video") {
      return Response.json(
        {
          error: {
            code: "VALIDATION_FAILED",
            message: "Video upload not supported; register a URL instead",
          },
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return Response.json(
        {
          error: {
            code: "VALIDATION_FAILED",
            message: `File exceeds ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB limit (simple upload)`,
          },
        },
        { status: 400 },
      );
    }

    const name = String(form.get("name") ?? file.name);
    const logoVariant = form.get("logoVariant") ? String(form.get("logoVariant")) : undefined;
    const altText = form.get("altText") ? String(form.get("altText")) : undefined;
    const category = form.get("category") ? String(form.get("category")) : undefined;
    const description = form.get("description") ? String(form.get("description")) : undefined;
    const tagsRaw = form.get("tags") ? String(form.get("tags")) : "";
    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const bytes = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "application/octet-stream";
    const bucket = kind === "document" ? "documents" : "media";
    const safeName = file.name.replace(/[^\w.-]+/g, "_");
    const path = `${ctx.organizationId}/${kind}/${Date.now()}-${safeName}`;

    let publicUrl = "";
    let storageBucket: string | undefined;
    let storagePath: string | undefined;

    if (hasSupabaseServiceRole()) {
      const client = createServiceClient();
      const storage = getStorageBucketClient(client, bucket);
      const { error } = await storage.upload(path, bytes, {
        contentType: mimeType,
        upsert: false,
      });
      if (error) throw error;
      const { data: pub } = storage.getPublicUrl(path);
      publicUrl = pub.publicUrl;
      storageBucket = bucket;
      storagePath = path;
    } else {
      publicUrl = `data:${mimeType};base64,${bytes.toString("base64")}`;
    }

    const data = await getCmsServices().createMediaAsset({
      organizationId: ctx.organizationId,
      kind,
      logoVariant,
      source: "upload",
      name,
      description,
      altText,
      category,
      tags,
      url: publicUrl,
      storageBucket,
      storagePath,
      mimeType,
      fileSizeBytes: bytes.byteLength,
      actorId: ctx.userId,
    });

    return Response.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof CmsError) return toCmsErrorResponse(error);
    return toAuthErrorResponse(error);
  }
}
