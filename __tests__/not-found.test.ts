import { expect, test } from 'vitest';
import { makeCaller } from './helper';

test('get a 404 for junk lesson', async () => {
  const caller = makeCaller({
    user: 1,
  });

  await expect(
    caller.getLessons.getLesson({
      lesson: 'this-is-not-a-lesson-slug',
    }),
  ).rejects.toMatchObject({
    code: 'NOT_FOUND',
  });
});

test('get a 404 for junk unit', async () => {
  const caller = makeCaller({
    user: 1,
  });

  await expect(
    caller.getUnits.getUnit({
      unit: 'this-is-not-a-unit-slug',
    }),
  ).rejects.toMatchObject({
    code: 'NOT_FOUND',
  });
});
