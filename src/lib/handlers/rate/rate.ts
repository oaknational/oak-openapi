import { router } from '@/lib/trpc';
import * as z from 'zod/v4';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, getRateLimiter } from '../../protect';
import { rateLimitResponseOpenAPISchema } from '@/lib/zod-openapi/generated/rate';
import { errorResponses } from '@/lib/errorResponses';

export const getRateLimit = router({
  getRateLimit: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/rate-limit',
        tags: ['internal'],
        errorResponses,
        summary: 'Current rate-limit status',
        description: `Use this when you need your current rate-limit status as a JSON body — for example, to display a quota indicator in a client.

Returns 'limit', 'remaining', and 'reset'. The same information is present on the 'X-RateLimit-*' headers of every other response, so you rarely need to call this directly. This endpoint does not itself count against your quota.`,
      },
      noCost: true,
    })
    .output(rateLimitResponseOpenAPISchema)
    .input(z.undefined())
    .query(async ({ ctx }) => {
      const { user } = ctx;

      // this is possible because we use publicProcedure - to avoid
      // using their requests
      if (!user) {
        throw new TRPCError({
          message: 'API token not provided to check rate limit',
          code: 'UNAUTHORIZED',
        });
      }

      const rateLimit = getRateLimiter(user.rateLimit);
      const rate = await rateLimit.check(user, true);

      if (rate.isSubjectToRateLimiting) {
        const { limit, remaining, reset } = rate;
        return { limit, remaining, reset };
      }

      return { limit: 0, remaining: 0, reset: 0 };
    }),
});
