import router from '~/lib/router';
import { createCallerFactory } from '~/lib/trpc';
import { vitest } from 'vitest';
import { User } from '~/lib/apikeys';
import { NextRequest } from 'next/server';

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

export function makeResHeaders() {
  return {
    get: vitest.fn(),
    set: vitest.fn(),
  };
}

export function makeCaller(opts = {}, res = makeRes()) {
  const createCaller = createCallerFactory(router);
  const callerOptions = {
    req: {} as NextRequest,
    resHeaders: makeResHeaders(),
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
