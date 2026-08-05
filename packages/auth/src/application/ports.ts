import type {
  AuthAuditRecord,
  AuthContext,
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
} from "../domain/models";

export interface AuthUnitOfWork {
  organizations: OrganizationRepository;
  users: UserRepository;
  memberships: MembershipRepository;
  roles: RoleRepository;
  permissions: PermissionRepository;
  rolePermissions: RolePermissionRepository;
  userRoles: UserRoleRepository;
  sessions: SessionRepository;
  invitations: InvitationRepository;
  passwordResets: PasswordResetRepository;
  mfaChallenges: MfaChallengeRepository;
  audit: AuthAuditRepository;
  commit(): Promise<void>;
}

export interface OrganizationRepository {
  findById(id: string): Promise<OrganizationRecord | null>;
  findBySlug(slug: string): Promise<OrganizationRecord | null>;
  save(org: OrganizationRecord): Promise<void>;
}

export interface UserRepository {
  findById(id: string): Promise<UserRecord | null>;
  findByEmail(email: string): Promise<UserRecord | null>;
  save(user: UserRecord): Promise<void>;
}

export interface MembershipRepository {
  findByUserAndOrg(userId: string, organizationId: string): Promise<MembershipRecord | null>;
  listByUser(userId: string): Promise<MembershipRecord[]>;
  save(membership: MembershipRecord): Promise<void>;
}

export interface RoleRepository {
  findById(id: string): Promise<RoleRecord | null>;
  findByKey(key: string, organizationId?: string): Promise<RoleRecord | null>;
  listSystem(): Promise<RoleRecord[]>;
  save(role: RoleRecord): Promise<void>;
}

export interface PermissionRepository {
  findByKey(key: string): Promise<PermissionRecord | null>;
  listAll(): Promise<PermissionRecord[]>;
  save(permission: PermissionRecord): Promise<void>;
}

export interface RolePermissionRepository {
  listPermissionKeysByRoleIds(roleIds: string[]): Promise<string[]>;
  save(link: RolePermissionRecord): Promise<void>;
}

export interface UserRoleRepository {
  listByUserAndOrg(userId: string, organizationId: string): Promise<UserRoleRecord[]>;
  save(link: UserRoleRecord): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface SessionRepository {
  findById(id: string): Promise<SessionRecord | null>;
  findByRefreshTokenHash(hash: string): Promise<SessionRecord | null>;
  findByAccessJti(jti: string): Promise<SessionRecord | null>;
  listByUser(userId: string): Promise<SessionRecord[]>;
  save(session: SessionRecord): Promise<void>;
}

export interface InvitationRepository {
  findByTokenHash(hash: string): Promise<InvitationRecord | null>;
  save(invitation: InvitationRecord): Promise<void>;
}

export interface PasswordResetRepository {
  findByTokenHash(hash: string): Promise<PasswordResetRecord | null>;
  save(reset: PasswordResetRecord): Promise<void>;
}

export interface MfaChallengeRepository {
  findById(id: string): Promise<MfaChallengeRecord | null>;
  save(challenge: MfaChallengeRecord): Promise<void>;
}

export interface AuthAuditRepository {
  append(entry: AuthAuditRecord): Promise<void>;
}

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: string;
  refreshExpiresAt: string;
  sessionId: string;
};

export type LoginResult =
  | { status: "authenticated"; tokens: TokenPair; context: AuthContext }
  | { status: "mfa_required"; challengeId: string; userId: string; organizationId: string };

export type ResolvedAccess = {
  context: AuthContext;
  session: SessionRecord;
  user: UserRecord;
};
