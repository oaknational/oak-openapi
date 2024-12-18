import { expect, test } from 'vitest';
import { authedCaller } from './helper';

test('years endpoint', async () => {
  const caller = authedCaller();

  const res = await caller.getSubjects.getSubjectYears({ subject: 'maths' });
  expect(Array.isArray(res)).toBeTruthy();
  expect(res.length).toBeGreaterThan(0);
  expect(res).toStrictEqual([
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
  ]);
});

test('subject with sequences and additional data', async () => {
  const caller = authedCaller();

  const res = await caller.getSubjects.getSubject({ subject: 'maths' });
  expect(Array.isArray(res)).toBeFalsy();
  expect(res).toHaveProperty('subjectTitle');
  expect(res).toHaveProperty('subjectSlug');
  expect(res).toHaveProperty('sequenceSlugs');
  expect(res.sequenceSlugs).toContain('maths-primary');
  expect(res.keyStages).toContainEqual({
    keyStageSlug: 'ks1',
    keyStageTitle: 'Key Stage 1',
  });
});

test('cannot access RSHE', async () => {
  const caller = authedCaller();

  await expect(
    async () => await caller.getSubjects.getSubject({ subject: 'rshe-pshe' }),
  ).rejects.toThrowError();
});
