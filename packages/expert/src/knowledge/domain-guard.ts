const DOMAIN_HINTS = [
  "pergon",
  "producto",
  "diluc",
  "ficha",
  "seguridad",
  "msds",
  "compatib",
  "material",
  "limpieza",
  "limpiar",
  "pasaporte",
  "passport",
  "qr",
  "verificar",
  "verificacion",
  "academia",
  "lote",
  "envase",
  "recarga",
  "concentr",
  "ratio",
  "hoja de seguridad",
];

const OFF_TOPIC_HINTS = [
  "receta de pastel",
  "bitcoin",
  "crypto",
  "tarea escolar",
  "homework",
  "chiste",
  "política",
  "election",
  "código en python para scrapear",
  "hackear",
  "falsificar",
];

export function looksOutOfDomain(message: string): boolean {
  const text = message.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  if (OFF_TOPIC_HINTS.some((hint) => text.includes(hint))) return true;
  const hasDomain = DOMAIN_HINTS.some((hint) => text.includes(hint));
  // Short greetings stay in domain (Expert can introduce itself).
  if (text.length < 40 && /^(hola|buenas|hello|hi|hey)\b/.test(text)) return false;
  return !hasDomain && text.length > 24;
}

export function formatSessionContext(input: {
  productSlug?: string;
  passportId?: string;
  qrCode?: string;
}): string {
  const lines: string[] = [];
  if (input.productSlug) lines.push(`Producto (slug): ${input.productSlug}`);
  if (input.passportId) lines.push(`Pasaporte / verificación: ${input.passportId}`);
  if (input.qrCode) lines.push(`Código QR: ${input.qrCode}`);
  if (lines.length === 0) return "Sin contexto de producto/QR/pasaporte en esta sesión.";
  return `Contexto automático de sesión:\n${lines.join("\n")}`;
}
