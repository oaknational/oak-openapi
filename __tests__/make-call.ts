import type { NextApiRequest, NextApiResponse } from 'next';
import router from '~/lib/router';
import { createCallerFactory } from '~/lib/trpc';
import { vitest } from 'vitest';
import { User } from '~/lib/apikeys';

export function makeRes() {
  return {
    writeHead: vitest.fn(),
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

export function authedCaller(user: User | number = 1) {
  const res = makeRes();
  return {
    caller: makeCaller({
      user,
      res,
    }),
    request: res,
  };
}
