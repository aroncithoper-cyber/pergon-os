import type { PublicVerificationOutcome, PublicVerificationResult } from "@pergon/identity";

export type VerifyPhase = "verifying" | "result" | "error";

export type OutcomePresentation = {
  outcome: PublicVerificationOutcome;
  title: string;
  description: string;
  tone: "success" | "destructive" | "warning" | "info" | "default";
  status: string;
};

export const outcomeCopy: Record<PublicVerificationOutcome, OutcomePresentation> = {
  original: {
    outcome: "original",
    title: "Producto Original",
    description: "La verificación confirma autenticidad dentro del sistema PerGon.",
    tone: "success",
    status: "success",
  },
  blocked: {
    outcome: "blocked",
    title: "Producto Bloqueado",
    description: "Este pasaporte está bloqueado. No debe comercializarse ni usarse como válido.",
    tone: "destructive",
    status: "blocked",
  },
  suspicious: {
    outcome: "suspicious",
    title: "QR Sospechoso",
    description:
      "Se detectó un patrón de riesgo. Trate el resultado con cautela y contacte soporte si es necesario.",
    tone: "warning",
    status: "warning",
  },
  retired: {
    outcome: "retired",
    title: "Producto Retirado",
    description: "Este envase/pasaporte fue retirado del ciclo activo.",
    tone: "info",
    status: "archived",
  },
  unavailable: {
    outcome: "unavailable",
    title: "No se pudo verificar",
    description:
      "El código no resolvió a un pasaporte verificable, o el QR no está activo para consulta pública.",
    tone: "default",
    status: "inactive",
  },
};

export function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const value = Date.parse(iso);
  if (Number.isNaN(value)) return null;
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: undefined,
  }).format(value);
}

export function formatDateTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const value = Date.parse(iso);
  if (Number.isNaN(value)) return null;
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function displayValue(
  value: string | number | null | undefined,
  fallback = "Sin dato",
): string {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

export async function fetchPublicVerification(
  passportId: string,
): Promise<PublicVerificationResult> {
  const response = await fetch(`/api/v1/verify/${encodeURIComponent(passportId)}`, {
    method: "GET",
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  const payload = (await response.json()) as {
    data?: PublicVerificationResult;
    error?: { code: string; message: string };
  };

  if (!response.ok || !payload.data) {
    throw new Error(payload.error?.message ?? "No se pudo completar la verificación");
  }

  return payload.data;
}
