import type { QrCodeRecord } from "./models";
import { QrNotActiveError } from "./errors";
import type { QrStatus } from "./states";

export function assertQrResolvable(qr: QrCodeRecord): void {
  if (qr.deletedAt) {
    throw new QrNotActiveError(qr.publicCode, "deleted");
  }

  if (qr.status !== "ACTIVE") {
    throw new QrNotActiveError(qr.publicCode, qr.status);
  }
}

export function nextQrStatusAfterRotate(current: QrStatus): QrStatus {
  if (current === "ACTIVE" || current === "SUSPENDED") {
    return "ROTATED";
  }
  return current;
}

/** Public verification codes should be opaque, URL-safe, and non-sequential. */
export function isValidPublicCodeFormat(code: string): boolean {
  return /^[A-Z0-9]{8,32}$/.test(code);
}
