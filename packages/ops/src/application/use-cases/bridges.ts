/**
 * Identity/Auth bridge modules for Admin Ops.
 * Passport/QR/Users/Roles domain lives in @pergon/identity and @pergon/auth.
 * Ops exposes permission metadata + filter contracts for Admin API composition.
 */
import { MODULE_PERMISSIONS } from "../../domain/base";
import { listQuerySchema } from "../../engines/filters";
import { ValidationFailedError } from "../../domain/base";

export const passportModuleContract = {
  module: "passport" as const,
  permissions: MODULE_PERMISSIONS.passport,
  listQuerySchema,
  events: ["passport.issued", "passport.transitioned", "passport.recharged", "passport.revoked"],
};

export const qrModuleContract = {
  module: "qr" as const,
  permissions: MODULE_PERMISSIONS.qr,
  listQuerySchema,
  events: ["qr.created", "qr.rotated", "qr.suspended", "qr.printed"],
};

export const usersModuleContract = {
  module: "users" as const,
  permissions: MODULE_PERMISSIONS.users,
  listQuerySchema,
  events: ["user.invited", "user.updated", "user.deactivated"],
};

export const rolesModuleContract = {
  module: "roles" as const,
  permissions: MODULE_PERMISSIONS.roles,
  listQuerySchema,
  events: ["roles.assigned", "roles.updated"],
};

export function parseBridgeListQuery(raw: unknown) {
  const parsed = listQuerySchema.safeParse(raw);
  if (!parsed.success) throw new ValidationFailedError(parsed.error.message);
  return parsed.data;
}

export const ADMIN_MODULE_REGISTRY = {
  dashboard: { permissions: MODULE_PERMISSIONS.dashboard },
  products: { permissions: MODULE_PERMISSIONS.products },
  customers: { permissions: MODULE_PERMISSIONS.customers },
  distributors: { permissions: MODULE_PERMISSIONS.distributors },
  production: { permissions: MODULE_PERMISSIONS.production },
  inventory: { permissions: MODULE_PERMISSIONS.inventory },
  qr: qrModuleContract,
  passport: passportModuleContract,
  users: usersModuleContract,
  roles: rolesModuleContract,
  automations: { permissions: MODULE_PERMISSIONS.automations },
  ai: { permissions: MODULE_PERMISSIONS.ai },
  reports: { permissions: MODULE_PERMISSIONS.reports },
  settings: { permissions: MODULE_PERMISSIONS.settings },
  audit: { permissions: MODULE_PERMISSIONS.audit },
  notifications: { permissions: MODULE_PERMISSIONS.notifications },
} as const;
