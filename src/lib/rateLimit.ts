import { Ratelimit as RateLimit } from '@upstash/ratelimit';
import { redis } from '~/lib/redis';

export const rateLimits = {
  standard: new RateLimit({
    redis,
    prefix: 'rateLimit:standard',
    // github is 5000/hour as an arbitrary reference
    limiter: RateLimit.slidingWindow(1000, '1 h'),
  }),
} as const;

export type RateLimitInfo =
  | {
      isSubjectToRateLimiting: false;
    }
  | {
      isSubjectToRateLimiting: true;
      limit: number;
      remaining: number;
      reset: number;
    };

export type RateLimiter = {
  check: (apiKey: string) => Promise<RateLimitInfo>;
};

/**
 * Function to create a user-based rate limiter with a given rate limit
 * @returns A function enforcing user rate limits
 * @example
 * const rateLimiter = userBasedRateLimiter(rateLimits.standard)
 * rateLimiter.check(apiKey)
 */
export const rateLimiter = (rateLimit: RateLimit): RateLimiter => {
  return {
    check: async (apiKey: string) => {
      if (!apiKey) {
        // should never happen
        throw new Error(
          'authenticated user is required for userBasedRateLimiter'
        );
      }

      if (await isUnlimited(apiKey)) {
        console.log('Bypassing rate-limit for oak user %s', apiKey);
        return { isSubjectToRateLimiting: false };
      }

      const { pending, ...rest } = await rateLimit.limit(apiKey);

      // NOTE: The upstash/ratelimit docs recommend context.waitUntil(pending) instead of awaiting upfront
      await pending;

      return {
        isSubjectToRateLimiting: true,
        ...rest,
      };
    },
  };
};

async function isUnlimited(apiKey: string): Promise<boolean> {
  return apiKey === process.env.OAK_API_AUTH_TOKEN;
}
