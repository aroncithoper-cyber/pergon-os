import { z } from "zod";

import { SYSTEM_ROLE_KEYS } from "../domain/catalog";

export const loginSchema = z.object({
  email: z
    .string()
    .email()
    .transform((v) => v.trim().toLowerCase()),
  password: z.string().min(8).max(128),
  organizationId: z.string().uuid().optional(),
  organizationSlug: z.string().min(2).max(64).optional(),
  ip: z.string().optional(),
  userAgent: z.string().max(512).optional(),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(20),
  ip: z.string().optional(),
  userAgent: z.string().max(512).optional(),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(20).optional(),
  accessToken: z.string().min(10).optional(),
  allSessions: z.boolean().optional().default(false),
});

export const inviteUserSchema = z.object({
  organizationId: z.string().uuid(),
  email: z
    .string()
    .email()
    .transform((v) => v.trim().toLowerCase()),
  roleKeys: z.array(z.string()).min(1),
  invitedBy: z.string().uuid().optional(),
  expiresInHours: z.number().int().min(1).max(720).optional().default(72),
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(20),
  fullName: z.string().min(2).max(120),
  password: z.string().min(8).max(128),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email()
    .transform((v) => v.trim().toLowerCase()),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8).max(128),
});

export const assignRolesSchema = z.object({
  organizationId: z.string().uuid(),
  userId: z.string().uuid(),
  roleKeys: z.array(z.enum(SYSTEM_ROLE_KEYS).or(z.string())).min(1),
});

export const createOrganizationSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9-]+$/),
  ownerEmail: z
    .string()
    .email()
    .transform((v) => v.trim().toLowerCase()),
  ownerFullName: z.string().min(2).max(120),
  ownerPassword: z.string().min(8).max(128),
});

export const verifyMfaSchema = z.object({
  challengeId: z.string().uuid(),
  code: z.string().regex(/^\d{6}$/),
  ip: z.string().optional(),
  userAgent: z.string().max(512).optional(),
});
