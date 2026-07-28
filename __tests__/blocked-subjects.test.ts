import { describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

vi.mock('@/lib/apikeys', () => ({
  findUserByKey: vi.fn().mockResolvedValue({
    id: 99,
    key: 'test-key',
    rateLimit: 0,
  }),
}));

vi.mock('@/lib/rateLimit', async (importOriginal: () => Promise<object>) => {
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

async function callTrpcEndpoint(path: string): Promise<Response> {
  const { GET } = await import('@/app/api/v0/[...trpc]/route');

  const req = new Request(`http://localhost:2727/api/v0${path}`, {
    method: 'GET',
    headers: {
      authorization: 'Bearer test-key',
    },
  }) as NextRequest;

  return GET(req);
}

async function callLessonAssetEndpoint(
  lesson: string,
  type: string,
): Promise<Response> {
  const { GET } =
    await import('@/app/api/v0/lessons/[lesson]/assets/[type]/route');

  const url = `http://localhost:2727/api/v0/lessons/${lesson}/assets/${type}`;
  const req = {
    nextUrl: new URL(url),
    url,
    method: 'GET',
    headers: new Headers({
      authorization: 'Bearer test-key',
    }),
  } as unknown as NextRequest;

  return GET(req, {
    params: Promise.resolve({ lesson, type }),
  });
}

describe('blocked subject endpoints return 404', () => {
  it.each([
    '/programmes/financial-education-primary-year-1',
    '/programmes/financial-education-primary-year-1/units',
    '/programmes/financial-education-primary-year-1/questions',
    '/programmes/financial-education-primary-year-1/assets',
    '/lessons/how-much-money-have-i-got/summary',
    '/lessons/how-much-money-have-i-got/quiz',
    '/lessons/how-much-money-have-i-got/assets',
  ])('GET %s returns 404', async (path) => {
    const res = await callTrpcEndpoint(path);
    expect(res.status).toBe(404);
  });

  it('GET /lessons/how-much-money-have-i-got/assets/slideDeck returns 404', async () => {
    const res = await callLessonAssetEndpoint(
      'how-much-money-have-i-got',
      'slideDeck',
    );
    expect(res.status).toBe(404);
  });
});
