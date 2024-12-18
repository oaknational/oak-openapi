import { expect, test } from 'vitest';
import { authedCaller } from './helper';

test('sequence with subjects', async () => {
  const caller = authedCaller();
  const slug = 'english-primary';
  const res = await caller.getSequences.getSequenceUnits({ sequence: slug });

  expect(res.length).toBe(6);
  expect(res.map((_) => _.year)).toStrictEqual([1, 2, 3, 4, 5, 6]);

  expect(res[0]).toHaveProperty('subjects');
  expect(res[0].subjects?.length).toBeGreaterThan(1);

  if (!res[0].subjects) {
    throw new Error('No subjects found');
  }
  const subject = res[0].subjects[1];

  expect(subject).toHaveProperty('units');

  expect(subject.units?.map((_) => _.order).slice(0, 3)).toStrictEqual([
    1, 2, 3,
  ]);

  const slugs = new Set(subject.units?.map((_) => _.unitSlug));
  expect(slugs.size).toBe(subject.units?.length);
});

test('sequence with subjects & tiers', async () => {
  const caller = authedCaller();
  const slug = 'science-secondary-aqa';
  const res = await caller.getSequences.getSequenceUnits({ sequence: slug });

  expect(res.length).toBe(5);
  expect(res.map((_) => _.year)).toStrictEqual([7, 8, 9, 10, 11]);

  const index = res.findIndex((_) => _.year === 11);

  expect(res[index]).toHaveProperty('subjects');

  if (!res[index].subjects) {
    throw new Error('No subjects found');
  }
  expect(res[index].subjects.map((_) => _.subject)).toContain('biology');
  expect(res[index].subjects.map((_) => _.subject)).toContain('physics');
  expect(res[index].subjects.map((_) => _.subject)).toContain('chemistry');
  expect(res[index].subjects.map((_) => _.subject)).toContain(
    'combined-science',
  );
  expect(res[index].subjects[0]).toHaveProperty('tiers');

  const tier = res[index].subjects[0].tiers?.[0];

  if (!tier) {
    throw new Error('No tier found');
  }

  expect(tier.units.map((_) => _.order).slice(0, 3)).toStrictEqual([1, 2, 3]);

  const slugs = new Set(tier.units.map((_) => _.unitSlug));
  expect(slugs.size).toBe(tier.units.length);
});

test('sequence with tiers', async () => {
  const caller = authedCaller();
  const slug = 'maths-secondary';
  const res = await caller.getSequences.getSequenceUnits({ sequence: slug });

  const index = res.findIndex((_) => _.year === 11);

  const subject = res[index];
  expect(subject).toHaveProperty('tiers');

  if (!subject.tiers) {
    // this is entirely for TS and red snakes, because if the code got here,
    // it means the test directly prior isn't working - i.e. stopping the code
    throw new Error('No tiers found');
  }

  expect(subject.tiers[0].units?.map((_) => _.order).slice(0, 3)).toStrictEqual(
    [1, 2, 3],
  );

  const slugs = new Set(subject.tiers[0].units.map((_) => _.unitSlug));
  expect(slugs.size).toBe(subject.tiers[0].units.length);
});
