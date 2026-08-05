import type {
  AuthAuditRecord,
  InvitationRecord,
  MembershipRecord,
  MfaChallengeRecord,
  OrganizationRecord,
  PasswordResetRecord,
  PermissionRecord,
  RolePermissionRecord,
  RoleRecord,
  SessionRecord,
  UserRecord,
  UserRoleRecord,
} from "../../domain/models";
import type {
  AuthAuditRepository,
  AuthUnitOfWork,
  InvitationRepository,
  MembershipRepository,
  MfaChallengeRepository,
  OrganizationRepository,
  PasswordResetRepository,
  PermissionRepository,
  RolePermissionRepository,
  RoleRepository,
  SessionRepository,
  UserRepository,
  UserRoleRepository,
} from "../../application/ports";

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class AuthMemoryStore {
  organizations = new Map<string, OrganizationRecord>();
  users = new Map<string, UserRecord>();
  memberships = new Map<string, MembershipRecord>();
  roles = new Map<string, RoleRecord>();
  permissions = new Map<string, PermissionRecord>();
  rolePermissions: RolePermissionRecord[] = [];
  userRoles = new Map<string, UserRoleRecord>();
  sessions = new Map<string, SessionRecord>();
  invitations = new Map<string, InvitationRecord>();
  passwordResets = new Map<string, PasswordResetRecord>();
  mfaChallenges = new Map<string, MfaChallengeRecord>();
  audit: AuthAuditRecord[] = [];
}

export function createMemoryUnitOfWork(store = new AuthMemoryStore()): AuthUnitOfWork {
  const organizations: OrganizationRepository = {
    async findById(id) {
      return store.organizations.get(id) ? clone(store.organizations.get(id)!) : null;
    },
    async findBySlug(slug) {
      for (const org of store.organizations.values()) {
        if (org.slug === slug && !org.deletedAt) return clone(org);
      }
      return null;
    },
    async save(org) {
      store.organizations.set(org.id, clone(org));
    },
  };

  const users: UserRepository = {
    async findById(id) {
      return store.users.get(id) ? clone(store.users.get(id)!) : null;
    },
    async findByEmail(email) {
      const normalized = email.trim().toLowerCase();
      for (const user of store.users.values()) {
        if (user.email === normalized && !user.deletedAt) return clone(user);
      }
      return null;
    },
    async save(user) {
      store.users.set(user.id, clone(user));
    },
  };

  const memberships: MembershipRepository = {
    async findByUserAndOrg(userId, organizationId) {
      for (const m of store.memberships.values()) {
        if (m.userId === userId && m.organizationId === organizationId) return clone(m);
      }
      return null;
    },
    async listByUser(userId) {
      return [...store.memberships.values()].filter((m) => m.userId === userId).map(clone);
    },
    async save(membership) {
      store.memberships.set(membership.id, clone(membership));
    },
  };

  const roles: RoleRepository = {
    async findById(id) {
      return store.roles.get(id) ? clone(store.roles.get(id)!) : null;
    },
    async findByKey(key, organizationId) {
      for (const role of store.roles.values()) {
        if (role.key !== key) continue;
        if (organizationId) {
          if (role.organizationId === organizationId) return clone(role);
          if (role.isSystem && !role.organizationId) return clone(role);
          continue;
        }
        if (!role.organizationId) return clone(role);
      }
      return null;
    },
    async listSystem() {
      return [...store.roles.values()].filter((r) => r.isSystem).map(clone);
    },
    async save(role) {
      store.roles.set(role.id, clone(role));
    },
  };

  const permissions: PermissionRepository = {
    async findByKey(key) {
      for (const permission of store.permissions.values()) {
        if (permission.key === key) return clone(permission);
      }
      return null;
    },
    async listAll() {
      return [...store.permissions.values()].map(clone);
    },
    async save(permission) {
      store.permissions.set(permission.id, clone(permission));
    },
  };

  const rolePermissions: RolePermissionRepository = {
    async listPermissionKeysByRoleIds(roleIds) {
      const idSet = new Set(roleIds);
      const permissionIds = new Set(
        store.rolePermissions.filter((rp) => idSet.has(rp.roleId)).map((rp) => rp.permissionId),
      );
      const keys = new Set<string>();
      for (const permission of store.permissions.values()) {
        if (permissionIds.has(permission.id)) keys.add(permission.key);
      }
      return [...keys];
    },
    async save(link) {
      const exists = store.rolePermissions.some(
        (rp) => rp.roleId === link.roleId && rp.permissionId === link.permissionId,
      );
      if (!exists) store.rolePermissions.push(clone(link));
    },
  };

  const userRoles: UserRoleRepository = {
    async listByUserAndOrg(userId, organizationId) {
      return [...store.userRoles.values()]
        .filter((ur) => ur.userId === userId && ur.organizationId === organizationId)
        .map(clone);
    },
    async save(link) {
      store.userRoles.set(link.id, clone(link));
    },
    async remove(id) {
      store.userRoles.delete(id);
    },
  };

  const sessions: SessionRepository = {
    async findById(id) {
      return store.sessions.get(id) ? clone(store.sessions.get(id)!) : null;
    },
    async findByRefreshTokenHash(hash) {
      for (const session of store.sessions.values()) {
        if (session.refreshTokenHash === hash) return clone(session);
      }
      return null;
    },
    async findByAccessJti(jti) {
      for (const session of store.sessions.values()) {
        if (session.accessTokenJti === jti) return clone(session);
      }
      return null;
    },
    async listByUser(userId) {
      return [...store.sessions.values()].filter((s) => s.userId === userId).map(clone);
    },
    async save(session) {
      store.sessions.set(session.id, clone(session));
    },
  };

  const invitations: InvitationRepository = {
    async findByTokenHash(hash) {
      for (const invitation of store.invitations.values()) {
        if (invitation.tokenHash === hash) return clone(invitation);
      }
      return null;
    },
    async save(invitation) {
      store.invitations.set(invitation.id, clone(invitation));
    },
  };

  const passwordResets: PasswordResetRepository = {
    async findByTokenHash(hash) {
      for (const reset of store.passwordResets.values()) {
        if (reset.tokenHash === hash) return clone(reset);
      }
      return null;
    },
    async save(reset) {
      store.passwordResets.set(reset.id, clone(reset));
    },
  };

  const mfaChallenges: MfaChallengeRepository = {
    async findById(id) {
      return store.mfaChallenges.get(id) ? clone(store.mfaChallenges.get(id)!) : null;
    },
    async save(challenge) {
      store.mfaChallenges.set(challenge.id, clone(challenge));
    },
  };

  const audit: AuthAuditRepository = {
    async append(entry) {
      store.audit.push(clone(entry));
    },
  };

  return {
    organizations,
    users,
    memberships,
    roles,
    permissions,
    rolePermissions,
    userRoles,
    sessions,
    invitations,
    passwordResets,
    mfaChallenges,
    audit,
    async commit() {
      // Memory adapter persists immediately on each save.
    },
  };
}

export function createSharedMemoryUnitOfWork(): AuthUnitOfWork {
  const g = globalThis as { __pergonAuthStore?: AuthMemoryStore };
  if (!g.__pergonAuthStore) {
    g.__pergonAuthStore = new AuthMemoryStore();
  }
  return createMemoryUnitOfWork(g.__pergonAuthStore);
}
