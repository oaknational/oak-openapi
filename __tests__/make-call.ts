import router from '@/lib/router';
import { createCallerFactory } from '@/lib/trpc';
import { vitest } from 'vitest';
import { User } from '@/lib/apikeys';
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

export function makeCaller(
  opts = {},
  rateLimit = false,
  headers = makeResHeaders() as unknown as Headers,
) {
  const createCaller = createCallerFactory(router);

  const callerOptions = {
    req: {
      headers,
    } as NextRequest,
    resHeaders: headers,
    rateLimit: undefined,
    user: null as User | null,
    ...opts,
  };

  if (typeof callerOptions.user === 'number') {
    callerOptions.user = {
      id: callerOptions.user,
      key: `test-key-${callerOptions.user as string}`,
      rateLimit: rateLimit ? 1000 : 0,
    } as User;
  }

  return createCaller(callerOptions);
}

export function authedCaller(user: User | number = 1) {
  const res = makeRes();
  const headers = makeResHeaders();
  return {
    caller: makeCaller(
      {
        user,
        res,
      },
      false,
      headers as unknown as Headers,
    ),
    request: res,
    headers,
  };
}
