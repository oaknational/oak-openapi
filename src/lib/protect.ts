import { TRPCError } from '@trpc/server';
import { t } from '~/lib/trpc';
import { RateLimitInfo, rateLimiter, rateLimits } from './rateLimit';

const rateLimit = rateLimiter(rateLimits.standard);

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const { user } = ctx;

  if (!user) {
    throw new TRPCError({
      message: 'API token not provided or invalid',
      code: 'UNAUTHORIZED',
    });
  }

  // rate limit the user
  let limit: RateLimitInfo | undefined;

  if (user) {
    limit = await rateLimit.check(user.key);
    if (limit.isSubjectToRateLimiting) {
      ctx.res.setHeader('X-RateLimit-Limit', limit.limit);
      ctx.res.setHeader('X-RateLimit-Remaining', limit.remaining);
      ctx.res.setHeader('X-RateLimit-Reset', limit.reset);
      if (limit.remaining <= 0) {
        ctx.res.setHeader('X-Retry-After', limit.reset);
        ctx.res.statusCode = 429; // not sure this is needed, but belt & braces

        // TODO: log this (properly) with the user's key
        console.log('Rate limit exceeded for user %s', user.key);

        throw new TRPCError({
          message: 'Rate limited exceeded',
          code: 'TOO_MANY_REQUESTS',
        });
      }
    }
  }

  return next();
});
