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

/**
 * Creates `password_hash` as `scrypt$<saltHex>$<derivedHex>`.
 * Must stay in lockstep with {@link verifyPassword} / {@link verifyPasswordDetailed}.
 */
export function hashPassword(password: string, salt = randomBytes(16).toString("hex")): string {
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

export type PasswordVerifyResult = {
  ok: boolean;
  algo: string | null;
  reason?: string;
};

/**
 * Verifies a `scrypt$...` password_hash. Same algorithm/params as {@link hashPassword}:
 * Node `scryptSync(password, salt, 64)` — not bcrypt/argon2.
 */
export function verifyPasswordDetailed(password: string, stored: string): PasswordVerifyResult {
  const trimmed = (stored ?? "").trim();
  if (!trimmed) {
    return { ok: false, algo: null, reason: "password_hash vacío" };
  }

  const parts = trimmed.split("$");
  const algo = parts[0] ?? null;

  if (algo !== "scrypt") {
    return {
      ok: false,
      algo,
      reason: `algoritmo detectado=${algo ?? "null"}; el login solo acepta scrypt (no bcrypt/argon2)`,
    };
  }

  if (parts.length !== 3) {
    return {
      ok: false,
      algo,
      reason: `formato inválido: ${parts.length} segmentos (esperado scrypt$salt$hash)`,
    };
  }

  const salt = parts[1] ?? "";
  const hash = parts[2] ?? "";
  if (!salt || !hash) {
    return { ok: false, algo, reason: "salt o hash ausente en password_hash" };
  }
  if (!/^[0-9a-f]+$/i.test(salt) || !/^[0-9a-f]+$/i.test(hash)) {
    return { ok: false, algo, reason: "salt/hash no son hex válido" };
  }

  try {
    const derived = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    if (expected.length !== derived.length) {
      return {
        ok: false,
        algo,
        reason: `longitud mismatch expected=${expected.length} derived=${derived.length} (hash truncado?)`,
      };
    }
    const ok = timingSafeEqual(expected, derived);
    return {
      ok,
      algo,
      reason: ok
        ? undefined
        : "scrypt timingSafeEqual=false (contraseña distinta al hash almacenado)",
    };
  } catch (error) {
    return {
      ok: false,
      algo,
      reason: `scryptSync falló: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export function verifyPassword(password: string, stored: string): boolean {
  return verifyPasswordDetailed(password, stored).ok;
}

export function hashIp(ip?: string | null): string | undefined {
  if (!ip) return undefined;
  return createHash("sha256").update(ip).digest("hex");
}

export function addDurationMs(fromIso: string, ms: number): string {
  return new Date(Date.parse(fromIso) + ms).toISOString();
}
