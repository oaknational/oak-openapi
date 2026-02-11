import { GET as _getLessonAsset } from '@/app/api/v0/lessons/[lesson]/assets/[type]/route';

import type { NextRequest } from 'next/server';
import { vi } from 'vitest';
export * from './make-call';

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

export function mockWithUser() {
  vi.mock('@/lib/context', () => {
    const user = { id: 1, name: 'Test User', key: 'test-user', rateLimit: 0 };
    return {
      getApiKeyFromRequest: vi.fn().mockReturnValue('test-user'),
      withUser: vi.fn().mockResolvedValue(user),
      Context: vi.fn().mockImplementation(() => ({
        user,
        resHeaders: new Headers(),
      })),
    };
  });
}

// create getLessonAsset using the exports
export async function getLessonAsset({
  lesson,
  type,
}: {
  lesson: string;
  type: string;
}): Promise<Response> {
  const request = {
    nextUrl: new URL(`http://localhost/lessons/${lesson}/assets/${type}`),
    headers: new Headers({
      authorization: 'Bearer 123',
    }),
  } as unknown as NextRequest;

  const params = Promise.resolve({
    lesson,
    type,
  });
  return _getLessonAsset(request, { params });
}
