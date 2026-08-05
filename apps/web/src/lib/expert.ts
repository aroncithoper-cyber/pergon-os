import {
  createExpertServices,
  createProviderRegistry,
  createSharedMemoryExpertUnitOfWork,
  ExpertError,
} from "@pergon/expert";
import { logger } from "@pergon/shared/logger";

export function getExpertServices() {
  const uow = createSharedMemoryExpertUnitOfWork();
  const providers = createProviderRegistry();
  return createExpertServices(uow, providers);
}

export function toExpertErrorResponse(error: unknown) {
  if (error instanceof ExpertError) {
    const status =
      error.code === "RATE_LIMITED"
        ? 429
        : error.code === "NOT_FOUND"
          ? 404
          : error.code === "VALIDATION_FAILED"
            ? 400
            : 400;
    return Response.json({ error: { code: error.code, message: error.message } }, { status });
  }

  logger.exception("expert.api_unhandled", error);
  return Response.json({ error: { code: "INTERNAL", message: "Internal error" } }, { status: 500 });
}

export function anonymousKeyFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "local";
  const ua = request.headers.get("user-agent") ?? "unknown";
  return `anon:${ip}:${ua}`.slice(0, 128);
}
