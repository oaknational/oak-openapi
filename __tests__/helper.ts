import type { NextApiRequest, NextApiResponse } from 'next';
import router from '~/lib/router';
import { createCallerFactory } from '~/lib/trpc';
import { vi } from 'vitest';

vi.mock('~/lib/rateLimit', async (importOriginal: () => Promise<object>) => {
  const actual = await importOriginal();
  return {
    ...actual,
    rateLimiter: () => ({
      check: vi.fn(() => {
        return {
          isSubjectToRateLimiting: false,
        };
      }),
    }),
  };
});

export function makeCaller(opts = {}) {
  const createCaller = createCallerFactory(router);
  const callerOptions = {
    req: {} as NextApiRequest,
    res: {} as NextApiResponse,
    rateLimit: undefined,
    user: null,
    ...opts,
  };

  return createCaller(callerOptions);
}
