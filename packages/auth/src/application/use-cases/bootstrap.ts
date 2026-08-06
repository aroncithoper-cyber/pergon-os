import { formatZodError } from "@pergon/shared/i18n";
import { logger } from "@pergon/shared/logger";
import {
  PERMISSION_KEYS,
  ROLE_PERMISSION_MAP,
  SYSTEM_ROLE_KEYS,
  ValidationFailedError,
  hashPassword,
  newId,
  verifyPassword,
} from "../../domain";
import { createOrganizationSchema } from "../../validation/schemas";
import type { AuthUnitOfWork } from "../ports";

function isDev() {
  return process.env.NODE_ENV === "development";
}

export async function bootstrapSystemCatalog(uow: AuthUnitOfWork) {
  const now = new Date().toISOString();
  logger.info("auth.bootstrap_catalog_start", {});

  for (const key of PERMISSION_KEYS) {
    const existing = await uow.permissions.findByKey(key);
    if (existing) continue;
    await uow.permissions.save({
      id: newId(),
      key,
      module: key.split(":")[0] ?? "general",
      description: key,
    });
  }

  for (const roleKey of SYSTEM_ROLE_KEYS) {
    let role = await uow.roles.findByKey(roleKey);
    if (!role) {
      role = {
        id: newId(),
        key: roleKey,
        name: roleKey,
        isSystem: true,
        createdAt: now,
      };
      await uow.roles.save(role);
    }

    for (const permissionKey of ROLE_PERMISSION_MAP[roleKey]) {
      const permission = await uow.permissions.findByKey(permissionKey);
      if (!permission) continue;
      await uow.rolePermissions.save({ roleId: role.id, permissionId: permission.id });
    }
  }

  await uow.commit();
  logger.info("auth.bootstrap_catalog_ok", {
    permissions: PERMISSION_KEYS.length,
    roles: SYSTEM_ROLE_KEYS.length,
  });
}

export async function createOrganizationWithOwner(uow: AuthUnitOfWork, raw: unknown) {
  await bootstrapSystemCatalog(uow);

  const parsed = createOrganizationSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(formatZodError(parsed.error));
  const input = parsed.data;
  const now = new Date().toISOString();

  const existingOrg = await uow.organizations.findBySlug(input.slug);
  let organizationId: string;

  if (existingOrg) {
    const existingUser = await uow.users.findByEmail(input.ownerEmail);
    const membership = existingUser
      ? await uow.memberships.findByUserAndOrg(existingUser.id, existingOrg.id)
      : null;

    if (existingUser && membership?.status === "active") {
      throw new ValidationFailedError("Ya existe una organizaci\u00f3n con ese slug.");
    }

    // Incomplete prior bootstrap (org without usable owner) — repair in place.
    organizationId = existingOrg.id;
    if (isDev()) {
      logger.warn("auth.org_bootstrap_repair", {
        organizationId,
        slug: input.slug,
        hasUser: Boolean(existingUser),
        hasMembership: Boolean(membership),
      });
    }
  } else {
    organizationId = newId();
    if (isDev()) logger.info("auth.step_1_org_insert_start", { organizationId, slug: input.slug });
    await uow.organizations.save({
      id: organizationId,
      name: input.name,
      slug: input.slug,
      status: "active",
      metadata: {},
      createdAt: now,
      updatedAt: now,
    });
    const orgRead = await uow.organizations.findById(organizationId);
    if (!orgRead) {
      throw new ValidationFailedError(
        "INSERT public.organizations fall\u00f3: no se pudo leer la organizaci\u00f3n tras el upsert.",
      );
    }
    if (isDev()) {
      logger.info("auth.step_1_org_insert_ok", {
        organizationId,
        table: "public.organizations",
        slug: orgRead.slug,
      });
    }
  }

  const passwordHash = hashPassword(input.ownerPassword);
  if (isDev()) {
    logger.info("auth.step_5_password_hash", {
      algo: passwordHash.split("$")[0],
      hashLength: passwordHash.length,
      parts: passwordHash.split("$").length,
    });
  }

  let user = await uow.users.findByEmail(input.ownerEmail);
  if (!user) {
    user = {
      id: newId(),
      email: input.ownerEmail,
      fullName: input.ownerFullName,
      status: "active",
      passwordHash,
      mfaEnabled: false,
      locale: "es",
      createdAt: now,
      updatedAt: now,
    };
    if (isDev())
      logger.info("auth.step_2_user_insert_start", { userId: user.id, email: user.email });
  } else {
    user.fullName = input.ownerFullName;
    user.passwordHash = passwordHash;
    user.status = "active";
    user.updatedAt = now;
    if (isDev())
      logger.info("auth.step_2_user_update_start", { userId: user.id, email: user.email });
  }

  await uow.users.save(user);

  const userRead = await uow.users.findByEmail(input.ownerEmail);
  if (!userRead) {
    throw new ValidationFailedError(
      "INSERT public.users fall\u00f3: el usuario no existe tras el upsert (tabla public.users).",
    );
  }
  if (!verifyPassword(input.ownerPassword, userRead.passwordHash)) {
    throw new ValidationFailedError(
      "password_hash persistido no verifica con scrypt (posible truncado o corrupci\u00f3n en public.users.password_hash).",
    );
  }
  if (isDev()) {
    logger.info("auth.step_2_user_insert_ok", {
      userId: userRead.id,
      email: userRead.email,
      status: userRead.status,
      table: "public.users",
      passwordVerifyOk: true,
    });
  }
  user = userRead;

  const membershipId = newId();
  if (isDev()) {
    logger.info("auth.step_3_membership_insert_start", {
      membershipId,
      organizationId,
      userId: user.id,
    });
  }
  await uow.memberships.save({
    id: membershipId,
    organizationId,
    userId: user.id,
    status: "active",
    createdAt: now,
    updatedAt: now,
  });
  const membershipRead = await uow.memberships.findByUserAndOrg(user.id, organizationId);
  if (!membershipRead || membershipRead.status !== "active") {
    throw new ValidationFailedError(
      "INSERT public.memberships fall\u00f3: membres\u00eda activa no encontrada tras el upsert.",
    );
  }
  if (isDev()) {
    logger.info("auth.step_3_membership_insert_ok", {
      membershipId: membershipRead.id,
      table: "public.memberships",
    });
  }

  const adminRole = await uow.roles.findByKey("admin");
  if (adminRole) {
    const userRoleId = newId();
    if (isDev()) {
      logger.info("auth.step_4_user_role_insert_start", {
        userRoleId,
        roleId: adminRole.id,
        userId: user.id,
      });
    }
    await uow.userRoles.save({
      id: userRoleId,
      userId: user.id,
      roleId: adminRole.id,
      organizationId,
      createdAt: now,
    });
    if (isDev()) {
      logger.info("auth.step_4_user_role_insert_ok", {
        role: "admin",
        table: "public.user_roles",
      });
    }
  } else if (isDev()) {
    logger.warn("auth.step_4_user_role_missing_admin", { userId: user.id });
  }

  await uow.audit.append({
    id: newId(),
    organizationId,
    actorUserId: user.id,
    action: "org:create",
    entityType: "organization",
    entityId: organizationId,
    metadata: { slug: input.slug },
    createdAt: now,
  });

  await uow.commit();
  if (isDev()) {
    logger.info("auth.step_6_commit_ok", {
      organizationId,
      userId: user.id,
      tables: ["public.organizations", "public.users", "public.memberships", "public.user_roles"],
    });
  }

  return { organizationId, userId: user.id };
}
