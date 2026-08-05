import {
  PERMISSION_KEYS,
  ROLE_PERMISSION_MAP,
  SYSTEM_ROLE_KEYS,
  ValidationFailedError,
  hashPassword,
  newId,
} from "../../domain";
import { createOrganizationSchema } from "../../validation/schemas";
import type { AuthUnitOfWork } from "../ports";

export async function bootstrapSystemCatalog(uow: AuthUnitOfWork) {
  const now = new Date().toISOString();

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
}

export async function createOrganizationWithOwner(uow: AuthUnitOfWork, raw: unknown) {
  await bootstrapSystemCatalog(uow);

  const parsed = createOrganizationSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(parsed.error.message);
  const input = parsed.data;

  const existingSlug = await uow.organizations.findBySlug(input.slug);
  if (existingSlug) throw new ValidationFailedError("Organization slug already exists");

  const now = new Date().toISOString();
  const organizationId = newId();
  await uow.organizations.save({
    id: organizationId,
    name: input.name,
    slug: input.slug,
    status: "active",
    metadata: {},
    createdAt: now,
    updatedAt: now,
  });

  let user = await uow.users.findByEmail(input.ownerEmail);
  if (!user) {
    user = {
      id: newId(),
      email: input.ownerEmail,
      fullName: input.ownerFullName,
      status: "active",
      passwordHash: hashPassword(input.ownerPassword),
      mfaEnabled: false,
      locale: "es",
      createdAt: now,
      updatedAt: now,
    };
  } else {
    user.fullName = input.ownerFullName;
    user.passwordHash = hashPassword(input.ownerPassword);
    user.status = "active";
    user.updatedAt = now;
  }
  await uow.users.save(user);

  await uow.memberships.save({
    id: newId(),
    organizationId,
    userId: user.id,
    status: "active",
    createdAt: now,
    updatedAt: now,
  });

  const adminRole = await uow.roles.findByKey("admin");
  if (adminRole) {
    await uow.userRoles.save({
      id: newId(),
      userId: user.id,
      roleId: adminRole.id,
      organizationId,
      createdAt: now,
    });
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
  return { organizationId, userId: user.id };
}
