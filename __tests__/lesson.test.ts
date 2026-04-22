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
  expect(res).not.toHaveProperty('canonicalUrl');
  expect(res).not.toHaveProperty('unitSlug');
  expect(res).not.toHaveProperty('unitTitle');
  expect(res.units.length).toBeGreaterThan(0);
  expect(res.units[0]).toHaveProperty('canonicalUrl');
});

test('lesson summary returns multiple unit contexts for programme variants', async () => {
  const caller = makeCaller({
    user: 1,
  });

  const res = await caller.getLessons.getLesson({
    lesson: 'light-and-colour',
  });

  expect(res.units.length).toBeGreaterThan(1);
  expect(res.units.map((unit) => unit.unitSlug)).toContain(
    'electromagnetic-waves',
  );
  expect(
    res.units.every((unit) =>
      unit.canonicalUrl.includes('/teachers/programmes/'),
    ),
  ).toBe(true);
  expect(
    new Set(
      res.units.map(
        (unit) =>
          `${unit.unitSlug}|${unit.unitTitle}|${unit.programmeFactors?.examBoard?.slug || ''}|${unit.programmeFactors?.pathway?.slug || ''}|${unit.programmeFactors?.tier?.slug || ''}`,
      ),
    ).size,
  ).toBe(res.units.length);
});
