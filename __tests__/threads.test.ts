import { expect, test } from 'vitest';
import { authedCaller } from './helper';

test('/threads returns unit counts', async () => {
  const { caller } = authedCaller();

  const res = await caller.getThreads.getAllThreads();

  expect(Array.isArray(res)).toBe(true);
  expect(res.length).toBeGreaterThan(0);
  expect(res[0]).toHaveProperty('title');
  expect(res[0]).toHaveProperty('slug');
  expect(res[0]).toHaveProperty('unitCount');
  expect(Number.isInteger(res[0]?.unitCount)).toBe(true);
  expect(res.every((thread) => thread.unitCount > 0)).toBe(true);
});
