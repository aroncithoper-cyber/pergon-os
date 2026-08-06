import { AuthError, ValidationFailedError, mapAuthHttpError } from "@pergon/auth";
import { hasSupabaseServiceRole } from "@pergon/shared/env";
import { logger } from "@pergon/shared/logger";

import { getAuthServices, toAuthErrorResponse } from "@/lib/auth";
import { getCmsServices } from "@/lib/cms";

function isDevelopment() {
  return process.env.NODE_ENV === "development";
}

function errorDetail(error: unknown): string {
  if (!error) return "Error desconocido";
  if (typeof error === "string") return error;
  if (error instanceof Error) {
    const extra = error as Error & {
      details?: string;
      hint?: string;
      code?: string;
      cause?: unknown;
    };
    const parts = [extra.message, extra.code, extra.details, extra.hint]
      .filter((part): part is string => Boolean(part && String(part).trim()))
      .map(String);
    if (extra.cause) parts.push(`cause=${errorDetail(extra.cause)}`);
    return parts.join(" | ") || extra.name || "Error";
  }
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function bootstrapErrorResponse(error: unknown) {
  logger.exception("org.bootstrap_failed", error);

  if (error instanceof AuthError || (error && typeof error === "object" && "code" in error)) {
    const mapped = mapAuthHttpError(error);
    const message = isDevelopment() ? errorDetail(error) || mapped.message : mapped.message;
    return Response.json(
      {
        error: {
          code: mapped.code,
          message,
          ...(isDevelopment() ? { detail: errorDetail(error) } : {}),
        },
      },
      { status: mapped.status },
    );
  }

  const message = isDevelopment()
    ? errorDetail(error)
    : "Ocurri\u00f3 un problema interno. Intenta nuevamente.";

  return Response.json(
    {
      error: {
        code: "BOOTSTRAP_FAILED",
        message,
        ...(isDevelopment() ? { detail: errorDetail(error) } : {}),
      },
    },
    { status: 500 },
  );
}

export async function POST(request: Request) {
  try {
    const authPersistence = hasSupabaseServiceRole() ? "supabase" : "memory";
    logger.info("org.bootstrap_start", { authPersistence, nodeEnv: process.env.NODE_ENV });

    if (authPersistence !== "supabase") {
      throw new ValidationFailedError(
        "Auth est\u00e1 en memoria: falta SUPABASE_SERVICE_ROLE_KEY o NEXT_PUBLIC_SUPABASE_URL. El bootstrap no puede persistir en public.organizations.",
      );
    }

    const setupSecret = (process.env.PERGON_SETUP_SECRET ?? "").trim();
    logger.info("org.bootstrap_secret_check", {
      configured: Boolean(setupSecret),
      configuredLength: setupSecret.length,
    });

    if (!setupSecret) {
      throw new ValidationFailedError(
        "El bootstrap de organizaci\u00f3n est\u00e1 desactivado. Define PERGON_SETUP_SECRET (entre comillas si contiene #).",
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const providedRaw =
      request.headers.get("x-pergon-setup-secret") ??
      (typeof body.setupSecret === "string" ? body.setupSecret : null);
    const provided = typeof providedRaw === "string" ? providedRaw.trim() : null;

    logger.info("org.bootstrap_secret_compare", {
      providedLength: provided?.length ?? 0,
      match: provided === setupSecret,
    });

    if (!provided || provided !== setupSecret) {
      throw new ValidationFailedError(
        isDevelopment()
          ? `Secreto de configuraci\u00f3n no coincide (recibido len=${provided?.length ?? 0}, esperado len=${setupSecret.length}). Si el valor en .env.local contiene #, envu\u00e9lvelo entre comillas dobles.`
          : "El secreto de configuraci\u00f3n no es v\u00e1lido.",
      );
    }

    const { setupSecret: _s, ...payload } = body;
    void _s;

    logger.info("org.bootstrap_create_org_user_start", {
      slug: typeof payload.slug === "string" ? payload.slug : undefined,
      ownerEmail: typeof payload.ownerEmail === "string" ? payload.ownerEmail : undefined,
    });

    const result = await getAuthServices().createOrganizationWithOwner(payload);

    logger.info("org.bootstrap_create_org_user_ok", {
      organizationId: result.organizationId,
      userId: result.userId,
      tables: ["public.organizations", "public.users", "public.memberships", "public.user_roles"],
      note: "PerGon Auth usa public.users (no auth.users de Supabase Auth).",
    });

    try {
      logger.info("org.bootstrap_cms_publish_start", {
        organizationId: result.organizationId,
      });
      await getCmsServices().publishHome({
        organizationId: result.organizationId,
        locale: "es",
        note: "Home inicial publicado en bootstrap",
        actorId: result.userId,
      });
      logger.info("org.bootstrap_cms_publish_ok", {
        organizationId: result.organizationId,
      });
    } catch (cmsError) {
      logger.exception("cms.bootstrap_publish_failed", cmsError);
      if (isDevelopment()) {
        throw Object.assign(
          new Error(
            `La organizaci\u00f3n se cre\u00f3 (${result.organizationId}), pero fall\u00f3 publicar el Home: ${errorDetail(cmsError)}`,
          ),
          { code: "CMS_BOOTSTRAP_PUBLISH_FAILED", cause: cmsError },
        );
      }
      throw new ValidationFailedError(
        "La organizaci\u00f3n se cre\u00f3, pero no fue posible publicar el Home inicial. Revisa CMS y vuelve a publicar.",
      );
    }

    logger.info("org.bootstrap_commit_ok", {
      organizationId: result.organizationId,
      userId: result.userId,
    });

    return Response.json({ data: result }, { status: 201 });
  } catch (error) {
    if (isDevelopment()) {
      return bootstrapErrorResponse(error);
    }
    return toAuthErrorResponse(error);
  }
}
