import { expect, test } from 'vitest';
import { makeCaller } from './helper';

test('get lesson from hasura', async () => {
  const caller = makeCaller({
    user: 1,
  });

  const res = await caller.getLessons.getLesson({
    lesson: 'joining-using-and',
  });

  expect(Array.isArray(res)).toBe(false); // we're expecting 1
  expect(res.keyStageSlug).toBe('ks1');
  expect(res.subjectSlug).toBe('english');
  expect(res.oakUrl).toBe(
    'https://www.thenational.academy/teachers/lessons/joining-using-and',
  );
});
