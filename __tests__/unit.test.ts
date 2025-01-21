import { expect, test } from 'vitest';
import { makeCaller, makeRes } from './helper';

test('get cycle 2 (2024-2025) unit', async () => {
  const caller = makeCaller({
    user: 1,
  });

  const res = await caller.getUnits.getUnit({
    unit: 'ceramics-cake-culture',
  });

  expect(Array.isArray(res)).toBe(false);
});

test('optionality unit 2023-24 cohort', async () => {
  const caller = makeCaller({
    user: 1,
  });

  const unit = 'life-in-a-capital-city-london-cardiff-775';
  const res = await caller.getUnits.getUnit({ unit });
  expect(res).toHaveProperty('unitSlug');
  expect(res.unitSlug).toBe(unit);
});

test('optionality unit 2024-25 cohort', async () => {
  const request = makeRes();
  const caller = makeCaller({
    user: 1,
    request,
  });

  const unit = 'iterative-design-nature-4776';
  const res = await caller.getUnits.getUnit({ unit });
  expect(res).toHaveProperty('unitSlug');
  expect(res.unitSlug).toBe(unit);
});
