import { NextApiRequest, NextApiResponse } from 'next';
import { APIKeyAuthObject } from '~/lib/context';
import router from '~/lib/router';
import { createCallerFactory } from '~/lib/trpc';

export function makeCaller() {
  const createCaller = createCallerFactory(router);
  return createCaller({
    req: {} as NextApiRequest,
    res: {} as NextApiResponse,
    rateLimit: {
      isSubjectToRateLimiting: true,
      limit: 100, // replace with your actual limit
      remaining: 100, // replace with your actual remaining limit
      reset: Date.now() + 60 * 60 * 1000, // replace with your actual reset time
    },
    auth: {} as APIKeyAuthObject, // replace with your actual auth object
  });
}
