import { expect, test } from 'vitest';
import { makeCaller } from './helper';

test('fetch transcripts from AI project', { timeout: 15 * 1000 }, async () => {
  const caller = makeCaller({
    user: 1,
  });

  const res = await caller.getTranscripts.searchTranscripts({
    q: 'who were the romans?',
  });

  expect(Array.isArray(res)).toBe(true);
  const first = res[0];
  expect(typeof first.lessonTitle).toBe('string');
  expect(first.transcriptSnippet?.toLowerCase()).toContain('romans');
});
