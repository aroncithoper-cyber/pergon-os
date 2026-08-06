/**
 * Human-readable HTTP status messages (es-MX).
 * Used by Admin api-client and error boundaries.
 */
export const HTTP_STATUS_MESSAGES_ES_MX: Record<number, string> = {
  400: "Los datos enviados no son válidos.",
  401: "Debes iniciar sesión.",
  403: "No tienes permisos para acceder.",
  404: "No encontramos la información solicitada.",
  409: "Ya existe un registro con esos datos.",
  422: "Los datos enviados no son válidos.",
  429: "Demasiadas solicitudes. Intenta de nuevo en un momento.",
  500: "Ocurrió un problema interno. Intenta nuevamente.",
  502: "Ocurrió un problema interno. Intenta nuevamente.",
  503: "El servicio no está disponible temporalmente. Intenta nuevamente.",
};

export function messageForHttpStatus(status: number, fallback?: string): string {
  return HTTP_STATUS_MESSAGES_ES_MX[status] ?? fallback ?? "No fue posible completar la operación.";
}
