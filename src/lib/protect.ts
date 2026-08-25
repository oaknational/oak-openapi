import { TRPCError } from '@trpc/server';
import { publicProcedure, t } from '@/lib/trpc';
import type { RateLimitInfo } from './rateLimit';
import { getRateLimiter } from './rateLimit';
import type { Context } from './context';
import type { OpenApiMeta } from 'trpc-to-openapi';

// Re-exported for the existing callers; it lives in ./rateLimit so that code
// needing a rate limiter doesn't have to pull in tRPC (and posthog-node) too.
export { getRateLimiter };

const protectLogic = async (
  ctx: Context,
  meta?: OpenApiMeta,
): Promise<void> => {
  const { user, resHeaders } = ctx;

  const noCost: boolean = (meta?.noCost as boolean) || false;

  if (!user) {
    throw new TRPCError({
      message: 'API token not provided or invalid',
      code: 'UNAUTHORIZED',
    });
  }

  // rate limit the user
  const rateLimit = getRateLimiter(user.rateLimit);
  const limit: RateLimitInfo = await rateLimit.check(user, noCost);
  if (limit.isSubjectToRateLimiting) {
    resHeaders.set('X-RateLimit-Limit', limit.limit.toString());
    resHeaders.set('X-RateLimit-Remaining', limit.remaining.toString());
    resHeaders.set('X-RateLimit-Reset', limit.reset.toString());
    if (limit.remaining <= 0 && !noCost) {
      resHeaders.set('X-Retry-After', limit.reset.toString());
      // resHeaders.statusCode = 429; // not sure this is needed, but belt & braces

      throw new TRPCError({
        message: 'Rate limited exceeded',
        code: 'TOO_MANY_REQUESTS',
      });
    }
  }
};

export const protect = async (opts: {
  ctx: Context;
  next: (opts?: { ctx?: Context }) => Promise<unknown>;
  meta?: OpenApiMeta;
}): Promise<unknown> => {
  const { ctx, next, meta } = opts;

  await protectLogic(ctx, meta);

  return next({ ctx });
};

const protectMiddleware = t.middleware(async ({ ctx, next, meta }) => {
  await protectLogic(ctx, meta);

  return next({ ctx });
});

export const protectedProcedure = publicProcedure.use(protectMiddleware);
