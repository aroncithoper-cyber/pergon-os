import { createServiceClient, type PergonServiceClient } from "@pergon/database";
import { hasSupabaseServiceRole } from "@pergon/shared/env";

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
import { createSharedMemoryUnitOfWork } from "../memory";

type OrgRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type UserRow = {
  id: string;
  email: string;
  full_name: string;
  status: string;
  password_hash: string;
  mfa_enabled: boolean;
  mfa_secret_encrypted: string | null;
  locale: string;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type MembershipRow = {
  id: string;
  organization_id: string;
  user_id: string;
  status: string;
  default_org_unit_id: string | null;
  created_at: string;
  updated_at: string;
};

type RoleRow = {
  id: string;
  organization_id: string | null;
  key: string;
  name: string;
  is_system: boolean;
  created_at: string;
};

type PermissionRow = {
  id: string;
  key: string;
  module: string;
  description: string;
};

type SessionRow = {
  id: string;
  user_id: string;
  organization_id: string;
  status: string;
  refresh_token_hash: string;
  access_token_jti: string;
  ip_hash: string | null;
  user_agent: string | null;
  expires_at: string;
  refresh_expires_at: string;
  revoked_at: string | null;
  mfa_verified_at: string | null;
  created_at: string;
  updated_at: string;
};

type InvitationRow = {
  id: string;
  organization_id: string;
  email: string;
  role_keys: unknown;
  token_hash: string;
  status: string;
  invited_by: string | null;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
};

type PasswordResetRow = {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
};

type MfaChallengeRow = {
  id: string;
  user_id: string;
  organization_id: string;
  status: string;
  expires_at: string;
  created_at: string;
};

type UserRoleRow = {
  id: string;
  user_id: string;
  role_id: string;
  organization_id: string;
  org_unit_id: string | null;
  created_at: string;
};

function mapOrg(row: OrgRow): OrganizationRecord {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status as OrganizationRecord["status"],
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at ?? undefined,
  };
}

function mapUser(row: UserRow): UserRecord {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    status: row.status as UserRecord["status"],
    passwordHash: row.password_hash,
    mfaEnabled: row.mfa_enabled,
    mfaSecretEncrypted: row.mfa_secret_encrypted ?? undefined,
    locale: row.locale,
    lastLoginAt: row.last_login_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at ?? undefined,
  };
}

function mapMembership(row: MembershipRow): MembershipRecord {
  return {
    id: row.id,
    organizationId: row.organization_id,
    userId: row.user_id,
    status: row.status as MembershipRecord["status"],
    defaultOrgUnitId: row.default_org_unit_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRole(row: RoleRow): RoleRecord {
  return {
    id: row.id,
    organizationId: row.organization_id ?? undefined,
    key: row.key,
    name: row.name,
    isSystem: row.is_system,
    createdAt: row.created_at,
  };
}

function mapPermission(row: PermissionRow): PermissionRecord {
  return {
    id: row.id,
    key: row.key,
    module: row.module,
    description: row.description,
  };
}

function mapSession(row: SessionRow): SessionRecord {
  return {
    id: row.id,
    userId: row.user_id,
    organizationId: row.organization_id,
    status: row.status as SessionRecord["status"],
    refreshTokenHash: row.refresh_token_hash,
    accessTokenJti: row.access_token_jti,
    ipHash: row.ip_hash ?? undefined,
    userAgent: row.user_agent ?? undefined,
    expiresAt: row.expires_at,
    refreshExpiresAt: row.refresh_expires_at,
    revokedAt: row.revoked_at ?? undefined,
    mfaVerifiedAt: row.mfa_verified_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapInvitation(row: InvitationRow): InvitationRecord {
  const roleKeys = Array.isArray(row.role_keys) ? row.role_keys.map(String) : [];
  return {
    id: row.id,
    organizationId: row.organization_id,
    email: row.email,
    roleKeys,
    tokenHash: row.token_hash,
    status: row.status as InvitationRecord["status"],
    invitedBy: row.invited_by ?? undefined,
    expiresAt: row.expires_at,
    acceptedAt: row.accepted_at ?? undefined,
    createdAt: row.created_at,
  };
}

function mapPasswordReset(row: PasswordResetRow): PasswordResetRecord {
  return {
    id: row.id,
    userId: row.user_id,
    tokenHash: row.token_hash,
    expiresAt: row.expires_at,
    usedAt: row.used_at ?? undefined,
    createdAt: row.created_at,
  };
}

function mapMfa(row: MfaChallengeRow): MfaChallengeRecord {
  return {
    id: row.id,
    userId: row.user_id,
    organizationId: row.organization_id,
    status: row.status as MfaChallengeRecord["status"],
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

function mapUserRole(row: UserRoleRow): UserRoleRecord {
  return {
    id: row.id,
    userId: row.user_id,
    roleId: row.role_id,
    organizationId: row.organization_id,
    orgUnitId: row.org_unit_id ?? undefined,
    createdAt: row.created_at,
  };
}

function throwDbError(table: string, operation: string, error: unknown): never {
  const e = error as {
    message?: string;
    code?: string;
    details?: string;
    hint?: string;
    name?: string;
  };
  const message = [
    `SQL Error en ${table}.${operation}`,
    e.code ? `code=${e.code}` : null,
    e.message ? `message=${e.message}` : null,
    e.details ? `details=${e.details}` : null,
    e.hint ? `hint=${e.hint}` : null,
    `table=${table}`,
  ]
    .filter(Boolean)
    .join(" | ");
  const err = new Error(message);
  (err as Error & { code: string; table: string }).code = e.code ?? "DB_ERROR";
  (err as Error & { table: string }).table = table;
  throw err;
}

export function createSupabaseAuthUnitOfWork(client?: PergonServiceClient): AuthUnitOfWork {
  const db = client ?? createServiceClient();

  const organizations: OrganizationRepository = {
    async findById(id) {
      const { data, error } = await db
        .from("organizations")
        .select("*")
        .eq("id", id)
        .is("deleted_at", null)
        .maybeSingle();
      if (error) throwDbError("public.organizations", "findById", error);
      return data ? mapOrg(data as OrgRow) : null;
    },
    async findBySlug(slug) {
      const { data, error } = await db
        .from("organizations")
        .select("*")
        .eq("slug", slug)
        .is("deleted_at", null)
        .maybeSingle();
      if (error) throwDbError("public.organizations", "findBySlug", error);
      return data ? mapOrg(data as OrgRow) : null;
    },
    async save(org) {
      const { error } = await db.from("organizations").upsert({
        id: org.id,
        name: org.name,
        slug: org.slug,
        status: org.status,
        metadata: org.metadata,
        created_at: org.createdAt,
        updated_at: org.updatedAt,
        deleted_at: org.deletedAt ?? null,
      } as never);
      if (error) throwDbError("public.organizations", "upsert", error);
    },
  };

  const users: UserRepository = {
    async findById(id) {
      const { data, error } = await db
        .from("users")
        .select("*")
        .eq("id", id)
        .is("deleted_at", null)
        .maybeSingle();
      if (error) throwDbError("public.users", "findById", error);
      return data ? mapUser(data as UserRow) : null;
    },
    async findByEmail(email) {
      const normalized = email.trim().toLowerCase();
      const { data, error } = await db
        .from("users")
        .select("*")
        .eq("email", normalized)
        .is("deleted_at", null)
        .maybeSingle();
      if (error) throwDbError("public.users", "findByEmail", error);
      return data ? mapUser(data as UserRow) : null;
    },
    async save(user) {
      const { error } = await db.from("users").upsert({
        id: user.id,
        email: user.email.trim().toLowerCase(),
        full_name: user.fullName,
        status: user.status,
        password_hash: user.passwordHash,
        mfa_enabled: user.mfaEnabled,
        mfa_secret_encrypted: user.mfaSecretEncrypted ?? null,
        locale: user.locale,
        last_login_at: user.lastLoginAt ?? null,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
        deleted_at: user.deletedAt ?? null,
      } as never);
      if (error) throwDbError("public.users", "upsert", error);
    },
  };

  const memberships: MembershipRepository = {
    async findByUserAndOrg(userId, organizationId) {
      const { data, error } = await db
        .from("memberships")
        .select("*")
        .eq("user_id", userId)
        .eq("organization_id", organizationId)
        .maybeSingle();
      if (error) throwDbError("public.memberships", "findByUserAndOrg", error);
      return data ? mapMembership(data as MembershipRow) : null;
    },
    async listByUser(userId) {
      const { data, error } = await db.from("memberships").select("*").eq("user_id", userId);
      if (error) throwDbError("public.memberships", "listByUser", error);
      return ((data as MembershipRow[]) ?? []).map(mapMembership);
    },
    async save(membership) {
      const { error } = await db.from("memberships").upsert({
        id: membership.id,
        organization_id: membership.organizationId,
        user_id: membership.userId,
        status: membership.status,
        default_org_unit_id: membership.defaultOrgUnitId ?? null,
        created_at: membership.createdAt,
        updated_at: membership.updatedAt,
      } as never);
      if (error) throwDbError("public.memberships", "upsert", error);
    },
  };

  const roles: RoleRepository = {
    async findById(id) {
      const { data, error } = await db.from("roles").select("*").eq("id", id).maybeSingle();
      if (error) throwDbError("public.auth", "query", error);
      return data ? mapRole(data as RoleRow) : null;
    },
    async findByKey(key, organizationId) {
      if (organizationId) {
        const { data: orgRole, error: orgError } = await db
          .from("roles")
          .select("*")
          .eq("key", key)
          .eq("organization_id", organizationId)
          .maybeSingle();
        if (orgError) throwDbError("public.roles", "findByKey", orgError);
        if (orgRole) return mapRole(orgRole as RoleRow);
      }
      const { data, error } = await db
        .from("roles")
        .select("*")
        .eq("key", key)
        .is("organization_id", null)
        .maybeSingle();
      if (error) throwDbError("public.auth", "query", error);
      return data ? mapRole(data as RoleRow) : null;
    },
    async listSystem() {
      const { data, error } = await db.from("roles").select("*").eq("is_system", true);
      if (error) throwDbError("public.auth", "query", error);
      return ((data as RoleRow[]) ?? []).map(mapRole);
    },
    async save(role) {
      const { error } = await db.from("roles").upsert({
        id: role.id,
        organization_id: role.organizationId ?? null,
        key: role.key,
        name: role.name,
        is_system: role.isSystem,
        created_at: role.createdAt,
      } as never);
      if (error) throwDbError("public.auth", "query", error);
    },
  };

  const permissions: PermissionRepository = {
    async findByKey(key) {
      const { data, error } = await db.from("permissions").select("*").eq("key", key).maybeSingle();
      if (error) throwDbError("public.auth", "query", error);
      return data ? mapPermission(data as PermissionRow) : null;
    },
    async listAll() {
      const { data, error } = await db.from("permissions").select("*");
      if (error) throwDbError("public.auth", "query", error);
      return ((data as PermissionRow[]) ?? []).map(mapPermission);
    },
    async save(permission) {
      const { error } = await db.from("permissions").upsert({
        id: permission.id,
        key: permission.key,
        module: permission.module,
        description: permission.description,
      } as never);
      if (error) throwDbError("public.auth", "query", error);
    },
  };

  const rolePermissions: RolePermissionRepository = {
    async listPermissionKeysByRoleIds(roleIds) {
      if (roleIds.length === 0) return [];
      const { data, error } = await db
        .from("role_permissions")
        .select("permission_id")
        .in("role_id", roleIds);
      if (error) throwDbError("public.auth", "query", error);
      const permissionIds = [
        ...new Set(((data as Array<{ permission_id: string }>) ?? []).map((r) => r.permission_id)),
      ];
      if (permissionIds.length === 0) return [];
      const { data: perms, error: permError } = await db
        .from("permissions")
        .select("key")
        .in("id", permissionIds);
      if (permError) throwDbError("public.permissions", "listKeys", permError);
      return ((perms as Array<{ key: string }>) ?? []).map((p) => p.key);
    },
    async save(link: RolePermissionRecord) {
      const { error } = await db.from("role_permissions").upsert({
        role_id: link.roleId,
        permission_id: link.permissionId,
      } as never);
      if (error) throwDbError("public.auth", "query", error);
    },
  };

  const userRoles: UserRoleRepository = {
    async listByUserAndOrg(userId, organizationId) {
      const { data, error } = await db
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .eq("organization_id", organizationId);
      if (error) throwDbError("public.auth", "query", error);
      return ((data as UserRoleRow[]) ?? []).map(mapUserRole);
    },
    async save(link) {
      const { error } = await db.from("user_roles").upsert({
        id: link.id,
        user_id: link.userId,
        role_id: link.roleId,
        organization_id: link.organizationId,
        org_unit_id: link.orgUnitId ?? null,
        created_at: link.createdAt,
      } as never);
      if (error) throwDbError("public.auth", "query", error);
    },
    async remove(id) {
      const { error } = await db.from("user_roles").delete().eq("id", id);
      if (error) throwDbError("public.auth", "query", error);
    },
  };

  const sessions: SessionRepository = {
    async findById(id) {
      const { data, error } = await db.from("sessions").select("*").eq("id", id).maybeSingle();
      if (error) throwDbError("public.auth", "query", error);
      return data ? mapSession(data as SessionRow) : null;
    },
    async findByRefreshTokenHash(hash) {
      const { data, error } = await db
        .from("sessions")
        .select("*")
        .eq("refresh_token_hash", hash)
        .maybeSingle();
      if (error) throwDbError("public.auth", "query", error);
      return data ? mapSession(data as SessionRow) : null;
    },
    async findByAccessJti(jti) {
      const { data, error } = await db
        .from("sessions")
        .select("*")
        .eq("access_token_jti", jti)
        .maybeSingle();
      if (error) throwDbError("public.auth", "query", error);
      return data ? mapSession(data as SessionRow) : null;
    },
    async listByUser(userId) {
      const { data, error } = await db.from("sessions").select("*").eq("user_id", userId);
      if (error) throwDbError("public.auth", "query", error);
      return ((data as SessionRow[]) ?? []).map(mapSession);
    },
    async save(session) {
      const { error } = await db.from("sessions").upsert({
        id: session.id,
        user_id: session.userId,
        organization_id: session.organizationId,
        status: session.status,
        refresh_token_hash: session.refreshTokenHash,
        access_token_jti: session.accessTokenJti,
        ip_hash: session.ipHash ?? null,
        user_agent: session.userAgent ?? null,
        expires_at: session.expiresAt,
        refresh_expires_at: session.refreshExpiresAt,
        revoked_at: session.revokedAt ?? null,
        mfa_verified_at: session.mfaVerifiedAt ?? null,
        created_at: session.createdAt,
        updated_at: session.updatedAt,
      } as never);
      if (error) throwDbError("public.auth", "query", error);
    },
  };

  const invitations: InvitationRepository = {
    async findByTokenHash(hash) {
      const { data, error } = await db
        .from("invitations")
        .select("*")
        .eq("token_hash", hash)
        .maybeSingle();
      if (error) throwDbError("public.auth", "query", error);
      return data ? mapInvitation(data as InvitationRow) : null;
    },
    async save(invitation) {
      const { error } = await db.from("invitations").upsert({
        id: invitation.id,
        organization_id: invitation.organizationId,
        email: invitation.email,
        role_keys: invitation.roleKeys,
        token_hash: invitation.tokenHash,
        status: invitation.status,
        invited_by: invitation.invitedBy ?? null,
        expires_at: invitation.expiresAt,
        accepted_at: invitation.acceptedAt ?? null,
        created_at: invitation.createdAt,
      } as never);
      if (error) throwDbError("public.auth", "query", error);
    },
  };

  const passwordResets: PasswordResetRepository = {
    async findByTokenHash(hash) {
      const { data, error } = await db
        .from("password_resets")
        .select("*")
        .eq("token_hash", hash)
        .maybeSingle();
      if (error) throwDbError("public.auth", "query", error);
      return data ? mapPasswordReset(data as PasswordResetRow) : null;
    },
    async save(reset) {
      const { error } = await db.from("password_resets").upsert({
        id: reset.id,
        user_id: reset.userId,
        token_hash: reset.tokenHash,
        expires_at: reset.expiresAt,
        used_at: reset.usedAt ?? null,
        created_at: reset.createdAt,
      } as never);
      if (error) throwDbError("public.auth", "query", error);
    },
  };

  const mfaChallenges: MfaChallengeRepository = {
    async findById(id) {
      const { data, error } = await db
        .from("mfa_challenges")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throwDbError("public.auth", "query", error);
      return data ? mapMfa(data as MfaChallengeRow) : null;
    },
    async save(challenge) {
      const { error } = await db.from("mfa_challenges").upsert({
        id: challenge.id,
        user_id: challenge.userId,
        organization_id: challenge.organizationId,
        status: challenge.status,
        expires_at: challenge.expiresAt,
        created_at: challenge.createdAt,
      } as never);
      if (error) throwDbError("public.auth", "query", error);
    },
  };

  const audit: AuthAuditRepository = {
    async append(entry: AuthAuditRecord) {
      const { error } = await db.from("auth_audit_logs").insert({
        id: entry.id,
        organization_id: entry.organizationId ?? null,
        actor_user_id: entry.actorUserId ?? null,
        action: entry.action,
        entity_type: entry.entityType,
        entity_id: entry.entityId,
        metadata: entry.metadata,
        request_id: entry.requestId ?? null,
        created_at: entry.createdAt,
      } as never);
      if (error) throwDbError("public.auth", "query", error);
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
      // Supabase persists on each write.
    },
  };
}

/** Prefer Supabase when service role is configured; otherwise shared memory. */
export function createDefaultAuthUnitOfWork(): AuthUnitOfWork {
  if (hasSupabaseServiceRole()) {
    // Never silent-fallback to memory when service role is configured:
    // bootstrap would "succeed" without writing public.organizations.
    return createSupabaseAuthUnitOfWork();
  }
  return createSharedMemoryUnitOfWork();
}
