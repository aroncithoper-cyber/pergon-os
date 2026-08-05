import type {
  AuditLogRecord,
  PassportEventRecord,
  PassportRecord,
  PassportVersionRecord,
  QrCodeRecord,
  RechargeRecord,
  ScanEventRecord,
  TrustSignalRecord,
} from "../../domain/models";
import type { QrStatus } from "../../domain/states";
import type {
  AuditRepository,
  EventRepository,
  IdentityUnitOfWork,
  PassportRepository,
  QrRepository,
  RechargeRepository,
  ScanRepository,
  TrustRepository,
  VersionRepository,
} from "../../application/ports";
import { ConcurrencyError } from "../../domain/errors";

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class MemoryStore {
  passports = new Map<string, PassportRecord>();
  qrCodes = new Map<string, QrCodeRecord>();
  events: PassportEventRecord[] = [];
  scans: ScanEventRecord[] = [];
  recharges = new Map<string, RechargeRecord>();
  trust: TrustSignalRecord[] = [];
  audit: AuditLogRecord[] = [];
  versions: PassportVersionRecord[] = [];
}

export function createMemoryUnitOfWork(store = new MemoryStore()): IdentityUnitOfWork {
  const passports: PassportRepository = {
    async findById(id) {
      return store.passports.get(id) ? clone(store.passports.get(id)!) : null;
    },
    async findByPublicId(organizationId, publicId) {
      for (const p of store.passports.values()) {
        if (p.organizationId === organizationId && p.publicId === publicId && !p.deletedAt) {
          return clone(p);
        }
      }
      return null;
    },
    async save(passport) {
      const existing = store.passports.get(passport.id);
      if (existing && existing.version > passport.version) {
        throw new ConcurrencyError("passport", passport.id);
      }
      store.passports.set(passport.id, clone(passport));
    },
    async softDelete(id, at, by) {
      const existing = store.passports.get(id);
      if (!existing) return;
      store.passports.set(id, {
        ...existing,
        deletedAt: at,
        updatedAt: at,
        updatedBy: by,
        version: existing.version + 1,
        eventSeq: existing.eventSeq + 1,
      });
    },
  };

  const qrCodes: QrRepository = {
    async findById(id) {
      return store.qrCodes.get(id) ? clone(store.qrCodes.get(id)!) : null;
    },
    async findByPublicCode(publicCode) {
      for (const qr of store.qrCodes.values()) {
        if (qr.publicCode === publicCode && !qr.deletedAt) return clone(qr);
      }
      return null;
    },
    async findActiveByPassportId(passportId) {
      for (const qr of store.qrCodes.values()) {
        if (qr.passportId === passportId && qr.status === "ACTIVE" && !qr.deletedAt) {
          return clone(qr);
        }
      }
      return null;
    },
    async save(qr) {
      store.qrCodes.set(qr.id, clone(qr));
    },
    async updateStatus(id, status: QrStatus, version) {
      const existing = store.qrCodes.get(id);
      if (!existing) return;
      store.qrCodes.set(id, {
        ...existing,
        status,
        version,
        updatedAt: new Date().toISOString(),
      });
    },
  };

  const events: EventRepository = {
    async append(event) {
      store.events.push(clone(event));
    },
    async listByPassportId(passportId, options) {
      const afterSeq = options?.afterSeq ?? -1;
      const limit = options?.limit ?? 100;
      return store.events
        .filter((e) => e.passportId === passportId && e.seq > afterSeq)
        .sort((a, b) => a.seq - b.seq)
        .slice(0, limit)
        .map(clone);
    },
  };

  const scans: ScanRepository = {
    async append(scan) {
      store.scans.push(clone(scan));
    },
    async countRecentByIpHash(ipHash, sinceIso) {
      return store.scans.filter((s) => s.ipHash === ipHash && s.createdAt >= sinceIso).length;
    },
    async countRecentByPassport(passportId, sinceIso) {
      return store.scans.filter((s) => s.passportId === passportId && s.createdAt >= sinceIso)
        .length;
    },
  };

  const recharges: RechargeRepository = {
    async findByIdempotencyKey(key) {
      return store.recharges.get(key) ? clone(store.recharges.get(key)!) : null;
    },
    async save(recharge) {
      store.recharges.set(recharge.idempotencyKey, clone(recharge));
    },
  };

  const trust: TrustRepository = {
    async save(signal) {
      store.trust.push(clone(signal));
    },
    async listOpenByPassport(passportId) {
      return store.trust
        .filter((t) => t.passportId === passportId && t.status === "open")
        .map(clone);
    },
  };

  const audit: AuditRepository = {
    async append(entry) {
      store.audit.push(clone(entry));
    },
  };

  const versions: VersionRepository = {
    async save(version) {
      store.versions.push(clone(version));
    },
    async listByPassportId(passportId) {
      return store.versions
        .filter((v) => v.passportId === passportId)
        .sort((a, b) => a.versionNumber - b.versionNumber)
        .map(clone);
    },
  };

  return {
    passports,
    qrCodes,
    events,
    scans,
    recharges,
    trust,
    audit,
    versions,
    async commit() {
      // Memory adapter persists immediately on each save.
    },
  };
}

export function createSharedMemoryUnitOfWork(): IdentityUnitOfWork {
  const globalStore = (globalThis as { __pergonIdentityStore?: MemoryStore }).__pergonIdentityStore;
  if (!globalStore) {
    const store = new MemoryStore();
    (globalThis as { __pergonIdentityStore?: MemoryStore }).__pergonIdentityStore = store;
    return createMemoryUnitOfWork(store);
  }
  return createMemoryUnitOfWork(globalStore);
}
