import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  assetsForLessonMock: vi.fn(),
  captureApiRequestEventMock: vi.fn(),
  getApiKeyFromRequestMock: vi.fn(),
  getVideoFromMuxMock: vi.fn(),
  listFilesWithMimeTypeMock: vi.fn(),
  parseQueryParamsMock: vi.fn(),
  protectMock: vi.fn(),
  withUserMock: vi.fn(),
}));

vi.mock('@/lib/analytics/posthogServer', () => ({
  captureApiRequestEvent: mocks.captureApiRequestEventMock,
  parseQueryParams: mocks.parseQueryParamsMock,
}));

vi.mock('@/lib/context', () => ({
  getApiKeyFromRequest: mocks.getApiKeyFromRequestMock,
  withUser: mocks.withUserMock,
}));

vi.mock('@/lib/protect', () => ({
  protect: mocks.protectMock,
}));

vi.mock('@/lib/bulk-data/data-stores', () => ({
  getGoogleCloudStorage: () => ({
    bucket: () => ({
      file: () => ({
        createReadStream: vi.fn(),
      }),
      getFiles: vi.fn(() => [[]]),
    }),
  }),
}));

vi.mock('@/lib/handlers/assets/assets', () => ({
  assetsForLesson: mocks.assetsForLessonMock,
}));

vi.mock('@/lib/handlers/assets/helpers', () => ({
  getVideoFromMux: mocks.getVideoFromMuxMock,
  listFilesWithMimeType: mocks.listFilesWithMimeTypeMock,
}));

const fetchMock = vi.fn();
const originalFetch = global.fetch;

import { POST as bulkPost } from '@/app/api/bulk/route';
import { GET as lessonAssetGet } from '@/app/api/v0/lessons/[lesson]/assets/[type]/route';

describe('Non-tRPC route analytics', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(
      new Response('video', {
        status: 200,
        headers: {
          'content-type': 'video/mp4',
        },
      }),
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    mocks.captureApiRequestEventMock.mockReset();
    mocks.getApiKeyFromRequestMock.mockReset();
    mocks.parseQueryParamsMock.mockReset();
    mocks.protectMock.mockReset();
    mocks.withUserMock.mockReset();
    mocks.assetsForLessonMock.mockReset();
    mocks.getVideoFromMuxMock.mockReset();
    mocks.listFilesWithMimeTypeMock.mockReset();

    mocks.getApiKeyFromRequestMock.mockReturnValue('test-api-key');
    mocks.parseQueryParamsMock.mockReturnValue({ qa: '1' });
    mocks.withUserMock.mockResolvedValue({
      id: 7,
      key: 'test-api-key',
      rateLimit: 0,
    });
    mocks.protectMock.mockImplementation(
      async ({ next }: { next: () => Promise<void> }) => next(),
    );
    mocks.assetsForLessonMock.mockResolvedValue({
      assets: {
        video: {
          download: 'https://cdn.example/video.mp4',
          stream: 'https://cdn.example/video.m3u8',
        },
      },
    });
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('captures API analytics for bulk route requests with args and query params', async () => {
    const req = new Request('http://localhost:2727/api/bulk?subject=maths', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-api-key',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        subjects: ['maths'],
      }),
    }) as NextRequest;

    const res = await bulkPost(req);

    expect(res.status).toBe(200);
    expect(mocks.captureApiRequestEventMock).toHaveBeenCalledTimes(1);
    expect(mocks.captureApiRequestEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: 'test-api-key',
        args: {
          subjects: ['maths'],
        },
        endpointPath: '/api/bulk',
        httpMethod: 'POST',
        queryParams: {
          qa: '1',
        },
        source: 'bulk_route',
        success: true,
        userId: 7,
      }),
    );
  });

  it('captures API analytics for lesson asset route requests with args and query params', async () => {
    const req = new Request(
      'http://localhost:2727/api/v0/lessons/lesson-1/assets/video?variant=hd',
      {
        method: 'GET',
        headers: {
          authorization: 'Bearer test-api-key',
        },
      },
    ) as NextRequest;

    const res = await lessonAssetGet(req, {
      params: Promise.resolve({
        lesson: 'lesson-1',
        type: 'video',
      }),
    });

    expect(res.status).toBe(302);
    expect(mocks.captureApiRequestEventMock).toHaveBeenCalledTimes(1);
    expect(mocks.captureApiRequestEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: 'test-api-key',
        args: {
          lesson: 'lesson-1',
          type: 'video',
        },
        endpointPath: '/api/v0/lessons/{lesson}/assets/{type}',
        httpMethod: 'GET',
        queryParams: {
          qa: '1',
        },
        source: 'lesson_assets_route',
        success: true,
        userId: 7,
      }),
    );
  });
});
