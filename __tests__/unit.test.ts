import { expect, test } from 'vitest';
import { makeCaller } from './helper';

test('get cycle 2 (2024-2025) unit', async () => {
  const caller = makeCaller({
    user: 1,
  });

  const res = await caller.getUnits.getUnit({
    unit: 'ceramics-cake-culture',
  });

  expect(Array.isArray(res)).toBe(false); // we're expecting 1
});

test('optionality unit', async () => {
  const caller = makeCaller({
    user: 1,
  });

  const res = await caller.getUnits.getUnit({
    unit: 'life-in-a-capital-city-london-cardiff-775',
  });

  expect(Array.isArray(res)).toBe(false); // we're expecting 1
});
