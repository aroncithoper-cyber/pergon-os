import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

import { randomUUID } from "node:crypto";

export function newId(): string {
  return randomUUID();
}

export function newToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function hashPassword(password: string, salt = randomBytes(16).toString("hex")): string {
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [algo, salt, hash] = stored.split("$");
  if (algo !== "scrypt" || !salt || !hash) return false;
  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (expected.length !== derived.length) return false;
  return timingSafeEqual(expected, derived);
}

export function hashIp(ip?: string | null): string | undefined {
  if (!ip) return undefined;
  return createHash("sha256").update(ip).digest("hex");
}

export function addDurationMs(fromIso: string, ms: number): string {
  return new Date(Date.parse(fromIso) + ms).toISOString();
}
