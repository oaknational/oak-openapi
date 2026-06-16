import { expect, test } from 'vitest';
import { authedCaller } from './helper';
import * as subjectConsts from '@/lib/keyStageAndSubjects';

test('/subjects returns subject slug list only', async () => {
  const { caller } = authedCaller();

  const res = await caller.getSubjects.getAllSubjects();

  expect(Array.isArray(res)).toBeTruthy();
  expect(res.length).toBeGreaterThan(0);
  expect(res).toContain('maths');
  expect(res).not.toContain('financial-education');
  expect(typeof res[0]).toBe('string');
});

test('subject with sequences and additional data', async () => {
  const { caller } = authedCaller();

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
  expect(res.ks4ProgrammeFactors.tier?.map((_) => _.slug).sort()).toEqual([
    'foundation',
    'higher',
  ]);
});

test('subject includes valid KS4 programme factor values', async () => {
  const { caller } = authedCaller();

  const res = await caller.getSubjects.getSubject({ subject: 'science' });

  expect(res.ks4ProgrammeFactors.examBoard?.map((_) => _.slug).sort()).toEqual(
    expect.arrayContaining(['aqa', 'edexcel', 'ocr']),
  );
  expect(res.ks4ProgrammeFactors.tier?.map((_) => _.slug).sort()).toEqual([
    'foundation',
    'higher',
  ]);
});

test('non-curriculum subject returns 404', async () => {
  const { caller } = authedCaller();

  await expect(
    async () => await caller.getSubjects.getSubject({ subject: 'rule-of-law' }),
  ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
});

test('years endpoint', async () => {
  const { caller } = authedCaller();

  const res = await caller.getSubjects.getSubjectYears({ subject: 'maths' });
  expect(Array.isArray(res)).toBeTruthy();
  expect(res.length).toBeGreaterThan(0);
  expect(res).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
});

test('sequence endpoint returns only the requested sequence metadata', async () => {
  const { caller } = authedCaller();

  const res = await caller.getSequences.getSubjectSequence({
    sequence: 'computing-secondary-core',
  });

  expect(Array.isArray(res)).toBeFalsy();
  expect(res.sequenceSlug).toBe('computing-secondary-core');
  expect(res.phaseTitle).toBe('secondary');
  expect(res.years).toStrictEqual([7, 8, 9, 10, 11]);
  expect(res).toMatchObject({
    keyStages: [{ keyStageSlug: 'ks3' }, { keyStageSlug: 'ks4' }],
  });
  expect(res).toHaveProperty('ks4ProgrammeFactors');
  expect(res.ks4ProgrammeFactors).toHaveProperty('pathway');
});

test('invalid sequence slug returns 404', async () => {
  const { caller } = authedCaller();

  await expect(
    async () =>
      await caller.getSequences.getSubjectSequence({
        sequence: 'computing-secondary-gcse',
      }),
  ).rejects.toMatchObject({ code: 'NOT_FOUND' });
});

test('subject constants structures', () => {
  const { keyStageSlugs, subjectsByKeyStage, subjectSlugs, subjects } =
    subjectConsts;

  expect(keyStageSlugs).toStrictEqual(['ks1', 'ks2', 'ks3', 'ks4']);

  const ks1 = subjectsByKeyStage('ks1');
  expect(Array.isArray(ks1)).toBeTruthy();
  expect(ks1.length).toBeGreaterThan(0);
  expect(Object.keys(ks1[0])).toStrictEqual(['slug', 'title']);
  expect(Array.isArray(subjectSlugs)).toBeTruthy();
  expect(subjectSlugs.length).toBeGreaterThan(0);
  expect(subjectSlugs[0]).toBeTypeOf('string');
  expect(subjectSlugs).includes('english');

  expect(Array.isArray(subjects)).toBeTruthy();
  expect(subjects.length).toBeGreaterThan(0);
  expect(subjects[0]).toBeTypeOf('string');
  expect(subjects).includes('English');
});

test('correct year sequence', async () => {
  const { caller } = authedCaller();

  const allYears = await caller.getSubjects.getSubjectYears({
    subject: 'maths',
  });
  expect(allYears).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

  const res = await caller.getSubjects.getSubject({ subject: 'maths' });
  expect(res.years).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  expect(res.sequenceSlugs[0].years).toStrictEqual([1, 2, 3, 4, 5, 6]);
  expect(res.sequenceSlugs[1].years).toStrictEqual([7, 8, 9, 10, 11]);
});

test('false subjects return 400', async () => {
  const { caller } = authedCaller();

  await expect(
    async () =>
      await caller.getSubjects.getSubjectYears({
        subject: 'maths-made-up',
      }),
  ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
});

test('Financial education returns 400', async () => {
  const { caller } = authedCaller();

  await expect(
    async () =>
      await caller.getSubjects.getSubjectYears({
        subject: 'financial-education',
      }),
  ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
});
