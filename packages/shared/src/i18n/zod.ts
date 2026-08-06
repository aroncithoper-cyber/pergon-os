import { messageForErrorCode } from "./domain-errors";
import { messageForHttpStatus } from "./http";

/**
 * Format Zod issues into a single human-readable Spanish (México) message.
 * Never expose raw JSON issue arrays to operators.
 */

export type ZodIssueLike = {
  code: string;
  path: readonly (string | number | symbol)[];
  message: string;
  validation?: string;
  minimum?: number | bigint;
  maximum?: number | bigint;
  inclusive?: boolean;
  exact?: boolean;
  type?: string;
  expected?: unknown;
  received?: unknown;
  [key: string]: unknown;
};

export type ZodErrorLike = {
  issues: readonly ZodIssueLike[];
};

const FIELD_LABELS: Record<string, string> = {
  email: "correo electrónico",
  password: "contraseña",
  name: "nombre",
  title: "título",
  slug: "slug",
  href: "enlace",
  label: "etiqueta",
  phone: "teléfono",
  body: "texto",
  description: "descripción",
  subtitle: "subtítulo",
  organizationSlug: "slug de organización",
  organizationName: "nombre de organización",
  setupSecret: "secreto de configuración",
  file: "archivo",
  url: "URL",
  locale: "idioma",
  token: "token",
};

function fieldLabel(path: readonly (string | number | symbol)[]): string {
  if (!path.length) return "este campo";
  const last = path[path.length - 1];
  const key = String(last);
  return FIELD_LABELS[key] ?? key;
}

function issueToMessage(issue: ZodIssueLike): string {
  const field = fieldLabel(issue.path);
  const code = issue.code;
  const validation = issue.validation;

  if (code === "invalid_string" && validation === "email") {
    return "El correo electrónico no es válido.";
  }
  if (code === "invalid_string" && validation === "url") {
    return "La URL no es válida.";
  }
  if (code === "invalid_string" && validation === "uuid") {
    return "El identificador no es válido.";
  }
  if (code === "invalid_string" && validation === "regex") {
    if (String(issue.path.at(-1)).toLowerCase().includes("slug")) {
      return "El slug solo puede contener letras minúsculas, números y guiones.";
    }
    if (String(issue.path.at(-1)).toLowerCase().includes("phone")) {
      return "Número de teléfono inválido.";
    }
    return `El valor de ${field} no tiene un formato válido.`;
  }
  if (code === "too_small") {
    const min = issue.minimum;
    if (issue.type === "string") {
      if (min === 1) return `El ${field} es obligatorio.`;
      if (String(issue.path.at(-1)) === "password" && Number(min) >= 8) {
        return "La contraseña debe tener al menos 8 caracteres.";
      }
      return `El ${field} debe tener al menos ${String(min)} caracteres.`;
    }
    if (issue.type === "array") {
      if (min === 1) return `Debes seleccionar al menos un elemento en ${field}.`;
      return `Debes seleccionar al menos ${String(min)} elementos en ${field}.`;
    }
    return `El valor de ${field} es demasiado pequeño.`;
  }
  if (code === "too_big") {
    const max = issue.maximum;
    if (issue.type === "string") {
      return `El ${field} no puede superar ${String(max)} caracteres.`;
    }
    return `El valor de ${field} es demasiado grande.`;
  }
  if (code === "invalid_type") {
    if (issue.received === "undefined" || issue.received === "null") {
      return `El ${field} es obligatorio.`;
    }
    return `El ${field} no tiene un tipo de dato válido.`;
  }
  if (code === "invalid_enum_value" || code === "invalid_literal") {
    return `El valor de ${field} no es una opción permitida.`;
  }
  if (code === "custom") {
    if (issue.message && !/^(Invalid|Required|Expected)/i.test(issue.message)) {
      return issue.message;
    }
  }

  const msg = issue.message?.trim();
  if (msg && !looksLikeZodJson(msg) && !/^(Invalid|Required|Expected|String must)/i.test(msg)) {
    return msg;
  }

  return `Los datos de ${field} no son válidos.`;
}

/** Detect raw Zod JSON dumps that must never reach operators. */
export function looksLikeZodJson(message: string): boolean {
  const t = message.trim();
  return (
    (t.startsWith("[") && t.includes("validation")) ||
    (t.startsWith("{") && t.includes('"code"')) ||
    t.includes('"invalid_string"') ||
    t.includes("validation:'regex'") ||
    t.includes('validation:"regex"')
  );
}

/**
 * Convert a ZodError (or duck-typed equivalent) into one Spanish sentence.
 * Accepts Zod 3 `ZodError` without coupling shared to the zod package types.
 */
export function formatZodError(error: unknown): string {
  const issues = (error as ZodErrorLike | undefined)?.issues;
  if (!issues?.length) {
    return "Los datos enviados no son válidos.";
  }
  const messages = issues.map((issue) => issueToMessage(issue));
  const unique = [...new Set(messages)];
  return unique.join(" ");
}

/**
 * Sanitize any error message before showing it in Admin UI.
 */
export function sanitizeOperatorMessage(
  message: string | undefined,
  options?: { code?: string; status?: number },
): string {
  const raw = (message ?? "").trim();
  if (!raw || looksLikeZodJson(raw)) {
    if (options?.status) return messageForHttpStatus(options.status);
    if (options?.code) return messageForErrorCode(options.code);
    return "Los datos enviados no son válidos.";
  }

  const englishMap: Record<string, string> = {
    "Invalid email or password": "El correo electrónico o la contraseña no son correctos.",
    Unauthorized: "Debes iniciar sesión.",
    Forbidden: "No tienes permisos para realizar esta acción.",
    "Internal error": "Ocurrió un problema interno. Intenta nuevamente.",
    "Request failed": "No fue posible completar la operación.",
    "Invalid input": "Los datos enviados no son válidos.",
    "Session not found or expired": "Tu sesión expiró o no es válida. Inicia sesión de nuevo.",
    "Invitation not found or invalid": "La invitación no es válida o ya no está disponible.",
    "MFA challenge required": "Se requiere verificación en dos pasos.",
    "CMS home document not found": "No encontramos el documento del Home en el CMS.",
    "file required": "Debes seleccionar un archivo.",
    "Invalid MFA code": "El código MFA no es válido.",
    "Invalid or expired reset token": "El token de restablecimiento no es válido o expiró.",
    "Organization slug already exists": "Ya existe una organización con ese slug.",
    "organizationId or organizationSlug is required":
      "Se requiere organizationId o el slug de la organización.",
    "Insufficient inventory": "Inventario insuficiente.",
    "Session is closed": "La sesión está cerrada.",
    "Automation is not enabled": "La automatización no está activa.",
    "Automation not enabled": "La automatización no está activa.",
    "Automation missing": "No encontramos esa automatización.",
    "Action failed": "La acción falló.",
    "Action threw": "La acción generó un error.",
    "Webhook not found": "No encontramos ese Webhook.",
    "Webhook secret required": "Se requiere el secreto del Webhook.",
    "Invalid webhook secret": "El secreto del Webhook no es válido.",
    "Daily Expert limit reached": "Se alcanzó el límite diario de Expert.",
    "Conversation not found": "No encontramos esa conversación.",
    "Message not found": "No encontramos ese mensaje.",
    "Conversation is closed": "La conversación está cerrada.",
    "Media asset not found": "No encontramos ese archivo de medios.",
    "Video URL is required": "La URL de video es obligatoria.",
    "Version not found": "No encontramos esa versión.",
    "Invalid preview token": "El token de vista previa no es válido.",
    "Missing preview token": "Falta el token de vista previa.",
    "Preview token expired": "El token de vista previa expiró.",
    "Upload failed": "No fue posible subir el archivo.",
    "automationId required": "Se requiere automationId.",
  };

  if (englishMap[raw]) return englishMap[raw];

  if (/^Missing permission:/i.test(raw)) {
    return "No tienes permisos para realizar esta acción.";
  }
  if (/not found/i.test(raw) && !/[áéíóúñ]/i.test(raw)) {
    return "No encontramos la información solicitada.";
  }

  return raw;
}
