import { ForbiddenOpsError, OpsError } from "../domain/base";

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
    const e = error as { code: string; message: string };
    return { status: 400, code: e.code, message: e.message };
  }
  return { status: 500, code: "INTERNAL", message: "Internal error" };
}
