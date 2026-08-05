import type {
  InvitationStatus,
  MembershipStatus,
  PermissionKey,
  SessionStatus,
  SystemRoleKey,
  UserStatus,
} from "./catalog";

export type EntityId = string;

export type OrganizationRecord = {
  id: EntityId;
  name: string;
  slug: string;
  status: "active" | "suspended";
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};

export type UserRecord = {
  id: EntityId;
  email: string;
  fullName: string;
  status: UserStatus;
  passwordHash: string;
  mfaEnabled: boolean;
  mfaSecretEncrypted?: string;
  locale: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};

export type MembershipRecord = {
  id: EntityId;
  organizationId: EntityId;
  userId: EntityId;
  status: MembershipStatus;
  defaultOrgUnitId?: EntityId;
  createdAt: string;
  updatedAt: string;
};

export type RoleRecord = {
  id: EntityId;
  organizationId?: EntityId;
  key: SystemRoleKey | string;
  name: string;
  isSystem: boolean;
  createdAt: string;
};

export type PermissionRecord = {
  id: EntityId;
  key: PermissionKey | string;
  module: string;
  description: string;
};

export type RolePermissionRecord = {
  roleId: EntityId;
  permissionId: EntityId;
};

export type UserRoleRecord = {
  id: EntityId;
  userId: EntityId;
  roleId: EntityId;
  organizationId: EntityId;
  orgUnitId?: EntityId;
  createdAt: string;
};

export type SessionRecord = {
  id: EntityId;
  userId: EntityId;
  organizationId: EntityId;
  status: SessionStatus;
  refreshTokenHash: string;
  accessTokenJti: string;
  ipHash?: string;
  userAgent?: string;
  expiresAt: string;
  refreshExpiresAt: string;
  revokedAt?: string;
  mfaVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type InvitationRecord = {
  id: EntityId;
  organizationId: EntityId;
  email: string;
  roleKeys: string[];
  tokenHash: string;
  status: InvitationStatus;
  invitedBy?: EntityId;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
};

export type PasswordResetRecord = {
  id: EntityId;
  userId: EntityId;
  tokenHash: string;
  expiresAt: string;
  usedAt?: string;
  createdAt: string;
};

export type MfaChallengeRecord = {
  id: EntityId;
  userId: EntityId;
  organizationId: EntityId;
  status: "pending" | "consumed" | "expired";
  expiresAt: string;
  createdAt: string;
};

export type AuthAuditRecord = {
  id: EntityId;
  organizationId?: EntityId;
  actorUserId?: EntityId;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  requestId?: string;
  createdAt: string;
};

export type AuthContext = {
  userId: EntityId;
  organizationId: EntityId;
  sessionId: EntityId;
  permissions: ReadonlySet<PermissionKey | string>;
  roleKeys: readonly string[];
  mfaVerified: boolean;
};
