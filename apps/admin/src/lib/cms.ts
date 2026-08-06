import {
  CmsError,
  createCmsServices,
  createDefaultCmsUnitOfWork,
  createSharedMemoryCmsUnitOfWork,
} from "@pergon/cms";
import { hasSupabaseServiceRole } from "@pergon/shared/env";
import { logger } from "@pergon/shared/logger";

export function getCmsServices() {
  const uow = hasSupabaseServiceRole()
    ? createDefaultCmsUnitOfWork()
    : createSharedMemoryCmsUnitOfWork();
  return createCmsServices(uow);
}

export function toCmsErrorResponse(error: unknown) {
  if (error instanceof CmsError) {
    const status =
      error.code === "NOT_FOUND"
        ? 404
        : error.code === "VALIDATION_FAILED" || error.code === "PREVIEW_INVALID"
          ? 400
          : error.code === "CONFLICT"
            ? 409
            : 400;
    return Response.json({ error: { code: error.code, message: error.message } }, { status });
  }
  logger.exception("cms.api_unhandled", error);
  return Response.json(
    {
      error: {
        code: "INTERNAL",
        message: "Ocurrió un problema interno. Intenta nuevamente.",
      },
    },
    { status: 500 },
  );
}

/** Notify Web to drop Home cache after publish/rollback/schedule drain. */
export async function revalidateWebHomeCache() {
  const webUrl = (process.env.NEXT_PUBLIC_WEB_URL ?? process.env.WEB_APP_URL ?? "").replace(
    /\/$/,
    "",
  );
  const secret = (process.env.CMS_REVALIDATE_SECRET ?? "").trim();
  if (!webUrl || !secret) {
    logger.info("cms.revalidate_skipped", { reason: "missing_web_url_or_secret" });
    return { ok: false as const, reason: "not_configured" };
  }

  try {
    const res = await fetch(`${webUrl}/api/v1/cms/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cms-revalidate-secret": secret,
      },
      body: JSON.stringify({ paths: ["/", "/preview/home"] }),
    });
    if (!res.ok) {
      logger.warn("cms.revalidate_failed", { status: res.status });
      return { ok: false as const, reason: "http_error" };
    }
    return { ok: true as const };
  } catch (error) {
    logger.exception("cms.revalidate_error", error);
    return { ok: false as const, reason: "network" };
  }
}
