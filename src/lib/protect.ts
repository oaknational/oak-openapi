import { TRPCError } from '@trpc/server';
import { t } from '~/lib/trpc';
import {
  RateLimitInfo,
  rateLimiter,
  rateLimits,
  defaultRateLimit,
} from './rateLimit';

export const getRateLimiter = (userLimit: number | undefined | null) => {
  if (userLimit !== defaultRateLimit && typeof userLimit === 'number') {
    return rateLimiter(rateLimits.custom(userLimit));
  } else {
    // we want to use the standard rate limit otherwise
    return rateLimiter(rateLimits.standard);
  }
};

export const protectedProcedure = t.procedure.use(
  async ({ ctx, next, meta }) => {
    const { user, resHeaders } = ctx;
    const noCost: boolean = (meta?.noCost as boolean) || false;

    if (!user) {
      throw new TRPCError({
        message: 'API token not provided or invalid',
        code: 'UNAUTHORIZED',
      });
    }

    // rate limit the user
    let limit: RateLimitInfo | undefined;

    if (user) {
      const rateLimit = getRateLimiter(user.rateLimit);
      limit = await rateLimit.check(user, noCost);
      if (limit.isSubjectToRateLimiting) {
        resHeaders.set('X-RateLimit-Limit', limit.limit.toString());
        resHeaders.set('X-RateLimit-Remaining', limit.remaining.toString());
        resHeaders.set('X-RateLimit-Reset', limit.reset.toString());
        if (limit.remaining <= 0 && !noCost) {
          resHeaders.set('X-Retry-After', limit.reset.toString());
          // resHeaders.statusCode = 429; // not sure this is needed, but belt & braces

          console.log('Rate limit exceeded for user %s', user.key);

          throw new TRPCError({
            message: 'Rate limited exceeded',
            code: 'TOO_MANY_REQUESTS',
          });
        }
      }
    }

    return next({ ctx });
  },
);
