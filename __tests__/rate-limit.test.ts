import { expect, test } from 'vitest';
import { authedCaller } from './make-call';
import { User } from '~/lib/apikeys';

test('rate limit reduces', async () => {
  const user: User = {
    id: 1,
    key: 'test-normal-rate',
  };
  const { caller } = authedCaller(user);

  const beforeRequest = await caller.getRateLimit.getRateLimit();
  await caller.getSubjects.getAllSubjects();
  const afterRequest = await caller.getRateLimit.getRateLimit();

  expect(afterRequest.remaining).toBe(beforeRequest.remaining - 1);
});

test('unlimited rate users', async () => {
  const user: User = {
    id: 1,
    key: 'test-unlimited-rate',
    rateLimit: 0,
  };
  const { caller } = authedCaller(user);

  const beforeRequest = await caller.getRateLimit.getRateLimit();
  await caller.getSubjects.getAllSubjects();
  const afterRequest = await caller.getRateLimit.getRateLimit();

  expect(afterRequest.remaining).toBe(beforeRequest.remaining);
});

test('custom rate limit', async () => {
  const user: User = {
    id: 1,
    key: 'test-3-rate',
    rateLimit: 3,
  };
  const { caller } = authedCaller(user);

  const beforeRequest = await caller.getRateLimit.getRateLimit();

  for (let i = 0; i < beforeRequest.remaining - 1; i++) {
    await caller.getSubjects.getAllSubjects();
  }

  // expect to throw
  await expect(() => caller.getSubjects.getAllSubjects()).rejects.toThrow();

  const afterRequest = await caller.getRateLimit.getRateLimit();

  expect(afterRequest.remaining).toBe(0);
});
