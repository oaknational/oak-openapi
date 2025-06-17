import { router } from '@/lib/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, getRateLimiter } from '../../protect';
import { rateLimitResponseOpenAPISchema } from '@/lib/zod-openapi/generated/rate';

export const getRateLimit = router({
  getRateLimit: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/rate-limit',
        tags: ['internal'],
        errorResponses: [],
        description:
          'Check your current rate limit status (note that your rate limit is also included in the headers of every response).\n\nThis specific endpoint does not cost any requests.',
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
