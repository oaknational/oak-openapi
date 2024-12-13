import { expect, test } from 'vitest';
import { makeCaller } from './helper';

function auth() {
  return makeCaller({
    user: 1,
    res: {
      setHeader() {},
    },
  });
}

test('years endpoint', async () => {
  const caller = auth();

  const res = await caller.subjects.getSubjectYears({ subject: 'maths' });
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
  const caller = auth();

  const res = await caller.subjects.getAllSubject({ subject: 'maths' });
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
