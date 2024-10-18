import { Ratelimit as RateLimit } from '@upstash/ratelimit';
import { redis } from '~/lib/redis';
import { User } from './apikeys';

export const defaultRateLimit = 1000;

export const rateLimits = {
  standard: new RateLimit({
    redis,
    prefix: 'rateLimit:standard',
    // github is 5000/hour as an arbitrary reference
    limiter: RateLimit.slidingWindow(defaultRateLimit, '1 h'),
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
  check: (user: User) => Promise<RateLimitInfo>;
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
    check: async (user: User) => {
      const apiKey = user.key;
      if (!apiKey) {
        // should never happen
        throw new Error(
          'authenticated user is required for userBasedRateLimiter'
        );
      }

      if (await isUnlimited(user)) {
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

async function isUnlimited(user: User): Promise<boolean> {
  const oakAuthToken = process.env.OAK_API_AUTH_TOKEN;
  if (!oakAuthToken) {
    return false;
  }

  if (user.rateLimit === 0) {
    return true;
  }

  return user.key === oakAuthToken;
}
