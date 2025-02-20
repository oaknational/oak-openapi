import { router } from '~/lib/trpc';
import { z } from 'zod';
import { defaultCaching } from '../networkCache';
import { rateLimiter, rateLimits } from '../rateLimit';
import { TRPCError } from '@trpc/server';
import { protectedProcedure } from '../protect';

const rateLimit = rateLimiter(rateLimits.standard);

export const getRateLimit = router({
  getRateLimit: protectedProcedure
    .use(defaultCaching)
    .meta({
      openapi: { method: 'GET', path: '/rate-limit', tags: ['internal'] },
      noCost: true,
    })
    .output(z.any())
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

      const rate = await rateLimit.check(user, true);

      if (rate.isSubjectToRateLimiting) {
        const { limit, remaining, reset } = rate;
        return { limit, remaining, reset };
      }

      return { rate: 0, unlimited: true };
    }),
});
