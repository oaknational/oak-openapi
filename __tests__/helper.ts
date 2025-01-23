import type { NextApiRequest, NextApiResponse } from 'next';
import router from '~/lib/router';
import { createCallerFactory } from '~/lib/trpc';
import { vitest, vi } from 'vitest';

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

export function makeRes() {
  return {
    setHeader: vitest.fn(),
    getHeader: vitest.fn(),
    pipe: vitest.fn(),
    on: vitest.fn(),
    once: vitest.fn(),
    emit: vitest.fn(),
    write: vitest.fn(),
    end: vitest.fn(),
  };
}

export function makeCaller(opts = {}, res = makeRes()) {
  const createCaller = createCallerFactory(router);
  const callerOptions = {
    req: {} as NextApiRequest,
    res: res as unknown as NextApiResponse,
    rateLimit: undefined,
    user: null,
    ...opts,
  };

  return createCaller(callerOptions);
}

export function authedCaller(user = 1) {
  const res = makeRes();
  return {
    caller: makeCaller({
      user,
      res,
    }),
    request: res,
  };
}
