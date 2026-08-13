import * as z from 'zod/v4';
import type { User } from '@/lib/apikeys';

/**
 * Request and response shapes for the admin API.
 *
 * Deliberately free of any `next/server` import: the admin UI components import
 * the inferred types from this file, and these routes are not part of the
 * public OpenAPI surface (see docs/ENDPOINTS.md).
 */

// 0 is the "unlimited" sentinel checked by isUnlimited in src/lib/rateLimit.ts.
export const rateLimitSchema = z.coerce.number().int().min(0);

const nameSchema = z.string().trim().min(1);
const emailSchema = z.email().trim().toLowerCase();

export const createUserSchema = z.object({
  name: nameSchema,
  company: nameSchema,
  email: emailSchema,
  rateLimit: rateLimitSchema.optional(),
});

export const updateUserSchema = z
  .object({
    name: nameSchema.optional(),
    company: nameSchema.optional(),
    email: emailSchema.optional(),
    rateLimit: rateLimitSchema.optional(),
  })
  .refine((values) => Object.keys(values).length > 0, {
    message: 'Provide at least one field to update',
  });

export const listUsersQuerySchema = z.object({
  search: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  sort: z
    .enum(['id', 'name', 'company', 'email', 'requests', 'lastRequest'])
    .default('id'),
  direction: z.enum(['asc', 'desc']).default('desc'),
});

export const userIdSchema = z.coerce.number().int().positive();

// Mirrors the CLI's "type roll to confirm" guard, so a stray or replayed POST
// can't destroy a live key.
export const rollKeySchema = z.object({ confirm: z.literal('roll') });

export const adminUserSchema = z.object({
  id: z.number(),
  key: z.string(),
  name: z.string().nullable(),
  company: z.string().nullable(),
  email: z.string().nullable(),
  rateLimit: z.number(),
  requests: z.number(),
  lastRequest: z.string().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

export const adminUsageSchema = z.object({
  isSubjectToRateLimiting: z.boolean(),
  limit: z.number().nullable(),
  remaining: z.number().nullable(),
  reset: z.number().nullable(),
});

export type CreateUserBody = z.infer<typeof createUserSchema>;
export type UpdateUserBody = z.infer<typeof updateUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type AdminUser = z.infer<typeof adminUserSchema>;
export type AdminUsage = z.infer<typeof adminUsageSchema>;

export interface AdminUserResponse {
  user: AdminUser;
}

export interface AdminUserDetailResponse extends AdminUserResponse {
  usage: AdminUsage;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  limit: number;
  offset: number;
}

export interface AdminRollKeyResponse extends AdminUserResponse {
  previousKey: string;
}

/**
 * Normalises a stored user into the response shape. Records created before
 * createdAt/updatedAt existed simply carry null, so the UI has one shape to
 * render rather than three.
 */
export function toAdminUser(user: User): AdminUser {
  return {
    id: user.id,
    key: user.key,
    name: user.name ?? null,
    company: user.company ?? null,
    email: user.email ?? null,
    rateLimit: Number(user.rateLimit ?? 0),
    requests: Number(user.requests ?? 0),
    lastRequest: user.lastRequest ?? null,
    createdAt: user.createdAt ?? null,
    updatedAt: user.updatedAt ?? null,
  };
}
