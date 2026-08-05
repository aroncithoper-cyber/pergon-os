import { z } from "zod";

import { PASSPORT_STATES, ACTOR_TYPES, CUSTODY_STAGES } from "../domain/states";

export const actorSchema = z.object({
  type: z.enum(ACTOR_TYPES),
  id: z.string().uuid().optional(),
});

export const createPassportSchema = z.object({
  organizationId: z.string().uuid(),
  productId: z.string().uuid(),
  batchId: z.string().uuid().optional(),
  publicId: z
    .string()
    .min(6)
    .max(40)
    .regex(/^[A-Z0-9_-]+$/i)
    .optional(),
  expiresAt: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).optional(),
  actor: actorSchema,
  correlationId: z.string().uuid().optional(),
  assignQr: z.boolean().optional().default(true),
});

export const transitionPassportSchema = z.object({
  passportId: z.string().uuid(),
  toState: z.enum(PASSPORT_STATES),
  reason: z.string().min(1).max(500),
  actor: actorSchema,
  correlationId: z.string().uuid().optional(),
});

export const rotateQrSchema = z.object({
  passportId: z.string().uuid(),
  reason: z.string().min(1).max(500),
  actor: actorSchema,
  correlationId: z.string().uuid().optional(),
});

export const verifyCodeSchema = z.object({
  publicCode: z
    .string()
    .min(8)
    .max(32)
    .transform((v) => v.trim().toUpperCase()),
  channel: z.enum(["web", "admin", "mobile", "api", "partner"]),
  ipHash: z.string().min(8).max(128).optional(),
  userAgent: z.string().max(512).optional(),
  geo: z.record(z.unknown()).optional(),
});

export const rechargePassportSchema = z.object({
  passportId: z.string().uuid(),
  idempotencyKey: z.string().min(8).max(128),
  reason: z.string().min(1).max(500),
  toExpiresAt: z.string().datetime().optional(),
  toState: z.enum(PASSPORT_STATES).optional(),
  actor: actorSchema,
  correlationId: z.string().uuid().optional(),
});

export const getHistorySchema = z.object({
  passportId: z.string().uuid(),
  limit: z.number().int().min(1).max(500).optional().default(100),
  afterSeq: z.number().int().min(0).optional(),
});

export const getPublicVerificationSchema = z.object({
  passportId: z
    .string()
    .min(6)
    .max(40)
    .transform((v) => v.trim().toUpperCase()),
  channel: z.enum(["web", "admin", "mobile", "api", "partner"]).optional().default("web"),
  ipHash: z.string().min(8).max(128).optional(),
  userAgent: z.string().max(512).optional(),
  geo: z.record(z.unknown()).optional(),
});

export type CreatePassportParsed = z.infer<typeof createPassportSchema>;
export type TransitionPassportParsed = z.infer<typeof transitionPassportSchema>;
export type RotateQrParsed = z.infer<typeof rotateQrSchema>;
export type VerifyCodeParsed = z.infer<typeof verifyCodeSchema>;
export type RechargePassportParsed = z.infer<typeof rechargePassportSchema>;
export type GetPublicVerificationParsed = z.infer<typeof getPublicVerificationSchema>;

export { CUSTODY_STAGES };
