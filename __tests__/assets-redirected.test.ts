import { vi, expect, test } from 'vitest';
import { getLessonAsset } from './helper';

vi.mock(
  '@/lib/handlers/assets/helpers',
  async (importOriginal: () => Promise<object>) => {
    const actual = await importOriginal();
    return {
      ...actual,
      getVideoFromMux: vi.fn().mockImplementation((streamUrl: string) => {
        return streamUrl.replace('.mp4', '.m3u8');
      }),
    };
  },
);

test('read a video redirect', async () => {
  const res = await getLessonAsset({
    lesson: 'checking-understanding-of-perimeter',
    type: 'video',
  });

  expect(res.status).toBe(302);
  const location = res.headers.get('location');
  expect(location).toMatch(/https:\/\/stream\.video\.thenational\.academy/);
});
