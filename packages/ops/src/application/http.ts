import { ForbiddenOpsError, OpsError } from "../domain/base";

const AUTH_STATUS_BY_CODE: Record<string, number> = {
  UNAUTHORIZED: 401,
  INVALID_CREDENTIALS: 401,
  SESSION_NOT_FOUND: 401,
  MFA_REQUIRED: 401,
  FORBIDDEN: 403,
  VALIDATION_FAILED: 400,
  USER_NOT_FOUND: 404,
  INVITATION_NOT_FOUND: 404,
  NOT_FOUND: 404,
  CONFLICT: 409,
};

export function mapOpsHttpError(error: unknown): {
  status: number;
  code: string;
  message: string;
} {
  if (error instanceof ForbiddenOpsError) {
    return { status: 403, code: error.code, message: error.message };
  }
  if (error instanceof OpsError) {
    const status =
      error.code === "NOT_FOUND"
        ? 404
        : error.code === "CONFLICT"
          ? 409
          : error.code === "VALIDATION_FAILED"
            ? 400
            : error.code === "FORBIDDEN"
              ? 403
              : 400;
    return { status, code: error.code, message: error.message };
  }
  if (error && typeof error === "object" && "code" in error && "message" in error) {
    const e = error as { code: string; message: string; name?: string };
    const status = AUTH_STATUS_BY_CODE[e.code] ?? 400;
    return { status, code: e.code, message: e.message };
  }
  return {
    status: 500,
    code: "INTERNAL",
    message: "Ocurrió un problema interno. Intenta nuevamente.",
  };
}
