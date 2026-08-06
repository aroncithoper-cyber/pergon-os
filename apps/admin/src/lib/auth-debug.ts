import { hashPassword, login, verifyPassword, type AuthUnitOfWork } from "@pergon/auth";

/** TEMPORARY — remove with auth diagnosis tooling. */
export function isAuthDebugEnabled(): boolean {
  return process.env.NODE_ENV === "development";
}

export function passwordAlgorithmLabel(
  stored: string | null | undefined,
): "scrypt" | "bcrypt" | "desconocido" | null {
  if (stored == null) return null;
  const trimmed = stored.trim();
  if (!trimmed) return "desconocido";
  if (trimmed.startsWith("scrypt$")) return "scrypt";
  if (
    trimmed.startsWith("$2a$") ||
    trimmed.startsWith("$2b$") ||
    trimmed.startsWith("$2y$") ||
    trimmed.startsWith("bcrypt$")
  ) {
    return "bcrypt";
  }
  return "desconocido";
}

export type DebugUserLookup = {
  userFound: boolean;
  id: string | null;
  email: string;
  status: string | null;
  organizationId: string | null;
  organizationName: string | null;
  organizationSlug: string | null;
  membershipFound: boolean;
  membershipStatus: string | null;
  roleFound: boolean;
  roles: string[];
  locale: string | null;
  lastLoginAt: string | null;
  passwordAlgorithm: "scrypt" | "bcrypt" | "desconocido" | null;
};

export async function lookupDebugUser(
  uow: AuthUnitOfWork,
  emailRaw: string,
): Promise<DebugUserLookup> {
  const email = emailRaw.trim().toLowerCase();
  const empty: DebugUserLookup = {
    userFound: false,
    id: null,
    email,
    status: null,
    organizationId: null,
    organizationName: null,
    organizationSlug: null,
    membershipFound: false,
    membershipStatus: null,
    roleFound: false,
    roles: [],
    locale: null,
    lastLoginAt: null,
    passwordAlgorithm: null,
  };

  const user = await uow.users.findByEmail(email);
  if (!user) return empty;

  const memberships = await uow.memberships.listByUser(user.id);
  const activeMembership = memberships.find((m) => m.status === "active") ?? memberships[0] ?? null;

  let organizationName: string | null = null;
  let organizationSlug: string | null = null;
  if (activeMembership) {
    const org = await uow.organizations.findById(activeMembership.organizationId);
    organizationName = org?.name ?? null;
    organizationSlug = org?.slug ?? null;
  }

  const roles: string[] = [];
  if (activeMembership) {
    const userRoles = await uow.userRoles.listByUserAndOrg(
      user.id,
      activeMembership.organizationId,
    );
    for (const link of userRoles) {
      const role = await uow.roles.findById(link.roleId);
      if (role) roles.push(role.key);
    }
  }

  return {
    userFound: true,
    id: user.id,
    email: user.email,
    status: user.status,
    organizationId: activeMembership?.organizationId ?? null,
    organizationName,
    organizationSlug,
    membershipFound: Boolean(activeMembership),
    membershipStatus: activeMembership?.status ?? null,
    roleFound: roles.length > 0,
    roles,
    locale: user.locale,
    lastLoginAt: user.lastLoginAt ?? null,
    passwordAlgorithm: passwordAlgorithmLabel(user.passwordHash),
  };
}

export type ProbeLoginStepKey =
  "userFound" | "passwordOk" | "membershipFound" | "rolesFound" | "sessionCreated";

export type ProbeLoginResult = {
  ok: boolean;
  failedAt: ProbeLoginStepKey | null;
  detail: string | null;
  steps: Record<ProbeLoginStepKey, boolean>;
  organizationId: string | null;
  roles: string[];
  sessionId: string | null;
};

export async function probeAuthLogin(
  uow: AuthUnitOfWork,
  input: {
    email: string;
    password: string;
    organizationSlug?: string;
    organizationId?: string;
    ip?: string;
    userAgent?: string;
  },
): Promise<ProbeLoginResult> {
  const steps: Record<ProbeLoginStepKey, boolean> = {
    userFound: false,
    passwordOk: false,
    membershipFound: false,
    rolesFound: false,
    sessionCreated: false,
  };

  const email = input.email.trim().toLowerCase();
  const user = await uow.users.findByEmail(email);
  if (!user || user.deletedAt) {
    return {
      ok: false,
      failedAt: "userFound",
      detail: "Usuario no encontrado en public.users.",
      steps,
      organizationId: null,
      roles: [],
      sessionId: null,
    };
  }
  if (user.status === "disabled" || user.status === "locked") {
    return {
      ok: false,
      failedAt: "userFound",
      detail: `Usuario encontrado pero status=${user.status}.`,
      steps,
      organizationId: null,
      roles: [],
      sessionId: null,
    };
  }
  steps.userFound = true;

  if (!verifyPassword(input.password, user.passwordHash)) {
    return {
      ok: false,
      failedAt: "passwordOk",
      detail: `Contraseña incorrecta (algoritmo=${passwordAlgorithmLabel(user.passwordHash)}).`,
      steps,
      organizationId: null,
      roles: [],
      sessionId: null,
    };
  }
  steps.passwordOk = true;

  let organizationId = input.organizationId;
  if (!organizationId && input.organizationSlug) {
    const org = await uow.organizations.findBySlug(input.organizationSlug);
    organizationId = org?.id;
  }
  if (!organizationId) {
    const memberships = (await uow.memberships.listByUser(user.id)).filter(
      (m) => m.status === "active",
    );
    if (memberships.length === 1) organizationId = memberships[0]!.organizationId;
  }
  if (!organizationId) {
    return {
      ok: false,
      failedAt: "membershipFound",
      detail: "No se pudo resolver organizationId (slug o membership única).",
      steps,
      organizationId: null,
      roles: [],
      sessionId: null,
    };
  }

  const membership = await uow.memberships.findByUserAndOrg(user.id, organizationId);
  if (!membership || membership.status !== "active") {
    return {
      ok: false,
      failedAt: "membershipFound",
      detail: "Sin membership activa para la organización.",
      steps,
      organizationId,
      roles: [],
      sessionId: null,
    };
  }
  steps.membershipFound = true;

  const userRoles = await uow.userRoles.listByUserAndOrg(user.id, organizationId);
  const roles: string[] = [];
  for (const link of userRoles) {
    const role = await uow.roles.findById(link.roleId);
    if (role) roles.push(role.key);
  }
  if (roles.length === 0) {
    return {
      ok: false,
      failedAt: "rolesFound",
      detail: "Membership ok pero sin roles asignados.",
      steps,
      organizationId,
      roles,
      sessionId: null,
    };
  }
  steps.rolesFound = true;

  try {
    const result = await login(uow, {
      email,
      password: input.password,
      organizationId,
      organizationSlug: input.organizationSlug,
      ip: input.ip,
      userAgent: input.userAgent,
    });

    if (result.status === "mfa_required") {
      return {
        ok: false,
        failedAt: "sessionCreated",
        detail: "Login llegó a MFA; sesión completa no creada.",
        steps,
        organizationId,
        roles,
        sessionId: null,
      };
    }

    steps.sessionCreated = true;
    return {
      ok: true,
      failedAt: null,
      detail: null,
      steps,
      organizationId,
      roles: [...result.context.roleKeys],
      sessionId: result.tokens.sessionId,
    };
  } catch (error) {
    return {
      ok: false,
      failedAt: "sessionCreated",
      detail: error instanceof Error ? error.message : "login() falló al crear sesión.",
      steps,
      organizationId,
      roles,
      sessionId: null,
    };
  }
}

export async function resetDebugUserPassword(
  uow: AuthUnitOfWork,
  input: { email: string; password: string },
): Promise<{
  ok: boolean;
  message: string;
  passwordAlgorithm: "scrypt" | "bcrypt" | "desconocido" | null;
  verifyPassword: boolean;
}> {
  const email = input.email.trim().toLowerCase();
  const user = await uow.users.findByEmail(email);
  if (!user || user.deletedAt) {
    return {
      ok: false,
      message: "Usuario no encontrado.",
      passwordAlgorithm: null,
      verifyPassword: false,
    };
  }

  const passwordHash = hashPassword(input.password);
  const now = new Date().toISOString();
  user.passwordHash = passwordHash;
  user.updatedAt = now;
  await uow.users.save(user);
  await uow.commit();

  const reloaded = await uow.users.findById(user.id);
  const verified = Boolean(reloaded && verifyPassword(input.password, reloaded.passwordHash));

  if (!verified) {
    return {
      ok: false,
      message: "Hash guardado pero verifyPassword() falló tras actualizar.",
      passwordAlgorithm: passwordAlgorithmLabel(reloaded?.passwordHash),
      verifyPassword: false,
    };
  }

  return {
    ok: true,
    message: "Contraseña actualizada correctamente",
    passwordAlgorithm: passwordAlgorithmLabel(reloaded!.passwordHash),
    verifyPassword: true,
  };
}
