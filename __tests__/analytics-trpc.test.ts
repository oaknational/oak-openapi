import { TRPCError } from '@trpc/server';
import {
  afterEach,
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import * as z from 'zod/v4';

import type { User } from '@/lib/apikeys';
import { createCallerFactory, publicProcedure, router } from '@/lib/trpc';

const analyticsTestRouter = router({
  fail: publicProcedure.query(() => {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'forced error',
    });
  }),
  ok: publicProcedure
    .input(
      z.object({
        includeUnits: z.boolean(),
        subject: z.string(),
      }),
    )
    .query(({ input }) => input),
});

const createCaller = createCallerFactory(analyticsTestRouter);

const makeContext = (opts?: {
  user?: User | null;
}): Parameters<typeof createCaller>[0] => {
  const apiKey = 'analytics-test-api-key';

  return {
    apiKey,
    req: new Request(
      'http://localhost:2727/api/v0/subjects?subject=maths&includeUnits=true&tag=one&tag=two',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
    ),
    resHeaders: {
      set: vi.fn(),
    },
    rateLimit: undefined,
    user: opts?.user || null,
  };
};

describe('tRPC analytics middleware', () => {
  const originalFetch = global.fetch;
  const fetchMock = vi.fn();

  beforeAll(() => {
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  afterAll(() => {
    vi.unstubAllEnvs();
    global.fetch = originalFetch;
  });

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ status: 1 })));
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('POSTHOG_API_KEY', 'test-posthog-api-key');
    vi.stubEnv('POSTHOG_API_HOST', 'https://eu.i.posthog.com');
  });

  it('captures successful requests with args and query params', async () => {
    const caller = createCaller(
      makeContext({
        user: {
          id: 42,
          key: 'analytics-test-api-key',
        },
      }),
    );

    await caller.ok({
      includeUnits: true,
      subject: 'maths',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://eu.i.posthog.com/capture/');

    const body = JSON.parse(options.body as string) as {
      distinct_id: string;
      event: string;
      properties: Record<string, unknown>;
    };

    expect(body.event).toBe('api_request');
    expect(body.distinct_id).toBe('api-user:42');
    expect(body.properties.success).toBe(true);
    expect(body.properties.error_code).toBeUndefined();
    expect(body.properties.args).toEqual({
      includeUnits: true,
      subject: 'maths',
    });
    expect(body.properties.query_params).toEqual({
      includeUnits: 'true',
      subject: 'maths',
      tag: ['one', 'two'],
    });
  });

  it('captures failed requests with error code', async () => {
    const caller = createCaller(
      makeContext({
        user: {
          id: 99,
          key: 'analytics-test-api-key',
        },
      }),
    );

    await expect(async () => await caller.fail()).rejects.toThrow(
      'forced error',
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(options.body as string) as {
      properties: Record<string, unknown>;
    };

    expect(body.properties.success).toBe(false);
    expect(body.properties.error_code).toBe('BAD_REQUEST');
  });

  it('does not fail procedure calls if analytics capture transport fails', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    fetchMock.mockRejectedValue(new Error('capture transport error'));

    const caller = createCaller(
      makeContext({
        user: {
          id: 123,
          key: 'analytics-test-api-key',
        },
      }),
    );

    await expect(
      caller.ok({
        includeUnits: true,
        subject: 'maths',
      }),
    ).resolves.toEqual({
      includeUnits: true,
      subject: 'maths',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Flush microtasks so the failed fetch's `.catch` executes.
    await new Promise<void>((resolve) => {
      queueMicrotask(resolve);
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
