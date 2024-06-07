import type { NextApiRequest, NextApiResponse } from 'next';
import router from '~/lib/router';
import { createCallerFactory } from '~/lib/trpc';

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
