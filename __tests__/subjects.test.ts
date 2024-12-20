import { expect, test } from 'vitest';
import { authedCaller } from './helper';

test('subject with sequences and additional data', async () => {
  const caller = authedCaller();

  const res = await caller.getSubjects.getSubject({ subject: 'maths' });
  expect(Array.isArray(res)).toBeFalsy();
  expect(res).toHaveProperty('subjectTitle');
  expect(res).toHaveProperty('subjectSlug');
  expect(res).toHaveProperty('sequenceSlugs');
  expect(res.sequenceSlugs.map((_) => _.sequenceSlug)).toContain(
    'maths-primary',
  );
  expect(res.keyStages).toContainEqual({
    keyStageSlug: 'ks1',
    keyStageTitle: 'Key Stage 1',
  });
});

test('years endpoint', async () => {
  const caller = authedCaller();

  const res = await caller.getSubjects.getSubjectYears({ subject: 'maths' });
  expect(Array.isArray(res)).toBeTruthy();
  expect(res.length).toBeGreaterThan(0);
  expect(res).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
});

test('cannot access RSHE', async () => {
  const caller = authedCaller();

  await expect(
    async () => await caller.getSubjects.getSubject({ subject: 'rshe-pshe' }),
  ).rejects.toThrowError();
});

test('sequence array has full metadata', async () => {
  const caller = authedCaller();

  const res = await caller.getSubjects.getSubjectSequence({
    subject: 'computing',
  });

  expect(Array.isArray(res)).toBeTruthy();
  const primary = res.find((_) => _.phaseSlug === 'primary');
  expect(primary).toBeTruthy();
  expect(primary?.phaseTitle).toBe('Primary');
  expect(primary?.keyStages.map((_) => _.keyStageSlug)).toStrictEqual([
    'ks1',
    'ks2',
  ]);
  expect(primary?.years).toStrictEqual([1, 2, 3, 4, 5, 6]);
  const secondary = res.find((_) => _.phaseSlug === 'secondary');
  expect(secondary).toBeTruthy();
  expect(secondary?.phaseTitle).toBe('Secondary');
  expect(secondary?.years).toStrictEqual([7, 8, 9, 10, 11]);
  expect(secondary?.keyStages.map((_) => _.keyStageSlug)).toStrictEqual([
    'ks3',
    'ks4',
  ]);
});
