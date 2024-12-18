import { expect, test } from 'vitest';
import { makeCaller } from './helper';

test('without auth', async () => {
  const caller = makeCaller();

  await expect(
    async () => await caller.getSubjects.getAllSubjects(),
  ).rejects.toThrow('API token not provided');
});

test('with user', async () => {
  const caller = makeCaller({
    user: 1,
  });

  const res = await caller.getSubjects.getAllSubjects();
  expect(Array.isArray(res)).toBeTruthy();
  expect(res.length).toBeGreaterThan(0);
});
