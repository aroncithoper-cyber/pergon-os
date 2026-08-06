/**
 * Domain error code → operator-facing message (es-MX).
 * Prefer mapping by `code` so English package messages never reach the UI.
 */
export const DOMAIN_ERROR_MESSAGES_ES_MX: Record<string, string> = {
  VALIDATION_FAILED: "Los datos enviados no son válidos.",
  INVALID_CREDENTIALS: "El correo electrónico o la contraseña no son correctos.",
  UNAUTHORIZED: "Debes iniciar sesión.",
  FORBIDDEN: "No tienes permisos para realizar esta acción.",
  SESSION_NOT_FOUND: "Tu sesión expiró o no es válida. Inicia sesión de nuevo.",
  USER_NOT_FOUND: "No encontramos ese usuario.",
  INVITATION_NOT_FOUND: "La invitación no es válida o ya no está disponible.",
  MFA_REQUIRED: "Se requiere verificación en dos pasos.",
  NOT_FOUND: "No encontramos la información solicitada.",
  CONFLICT: "Ya existe un registro con esos datos.",
  PREVIEW_INVALID: "El enlace de vista previa no es válido o expiró.",
  INTERNAL: "Ocurrió un problema interno. Intenta nuevamente.",
  HTTP_ERROR: "No fue posible completar la operación.",
  PASSPORT_NOT_FOUND: "No encontramos ese pasaporte.",
  QR_NOT_FOUND: "No encontramos ese código QR.",
  QR_NOT_ACTIVE: "El código QR no está activo.",
  PASSPORT_DELETED: "Este pasaporte fue eliminado.",
  INVALID_TRANSITION: "No se puede realizar ese cambio de estado.",
  CONCURRENCY_CONFLICT: "Otro cambio se aplicó al mismo tiempo. Actualiza e intenta de nuevo.",
  RATE_LIMITED: "Se alcanzó el límite diario de Expert.",
  PREVIEW_EXPIRED: "El enlace de vista previa no es válido o expiró.",
  MEDIA_NOT_FOUND: "No encontramos ese archivo de medios.",
};

export function messageForErrorCode(code: string | undefined, fallback?: string): string {
  if (!code) return fallback ?? "No fue posible completar la operación.";
  return DOMAIN_ERROR_MESSAGES_ES_MX[code] ?? fallback ?? "No fue posible completar la operación.";
}
