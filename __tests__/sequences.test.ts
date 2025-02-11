import { expect, test } from 'vitest';
import { authedCaller } from './helper';
import {
  UnitWithOptions,
  UnitWithoutOptions,
  YearSequence,
  yearSequenceKS4WithExamSubjects,
} from '~/lib/handlers/sequences';

test('sequence with subjects', async () => {
  const { caller } = authedCaller();
  const slug = 'english-primary';
  const res = await caller.getSequences.getSequenceUnits({ sequence: slug });

  expect(res.length).toBe(6);
  expect(res.map((_) => _.year)).toStrictEqual([1, 2, 3, 4, 5, 6]);

  const year1 = res.find((_) => _.year === 1);

  if (!year1 || !('units' in year1)) {
    throw new Error('No year 1 found');
  }

  const subjects1 = new Set(
    year1.units
      ?.map((_) => {
        if ('categories' in _ && Array.isArray(_.categories)) {
          return _.categories.map((_) => _.categoryTitle);
        }
      })
      .flat(Infinity)
      .filter(Boolean) as string[],
  );

  expect(Array.from(subjects1).sort()).toStrictEqual(
    ['Reading, writing & oracy', 'Grammar', 'Handwriting'].sort(),
  );
});

test('sequence with exam subjects & tiers', async () => {
  const { caller } = authedCaller();
  const slug = 'science-secondary-aqa';
  const res = await caller.getSequences.getSequenceUnits({ sequence: slug });

  expect(res.length).toBe(5);
  expect(res.map((_) => _.year)).toStrictEqual([7, 8, 9, 10, 11]);

  const index = res.findIndex((_) => _.year === 11);
  const year11 = res[index] as yearSequenceKS4WithExamSubjects;

  if (!year11) {
    throw new Error('No year 11 found');
  }

  // try to find subjectCategories in the units
  const subjects = new Set(
    year11.examSubjects.map(({ examSubjectTitle }) => examSubjectTitle),
  );

  expect(Array.from(subjects).sort()).toStrictEqual(
    ['Biology', 'Chemistry', 'Combined science', 'Physics'].sort(),
  );

  const tiers = new Set(
    year11.examSubjects
      .map((subject) => {
        if ('tiers' in subject) {
          return subject.tiers.map((tier) => tier.tier);
        }
      })
      .flat(Infinity),
  );

  expect(Array.from(tiers).sort()).toStrictEqual(['foundation', 'higher']);
});

test('sequence with tiers', async () => {
  const { caller } = authedCaller();
  const slug = 'maths-secondary';
  const res = await caller.getSequences.getSequenceUnits({ sequence: slug });

  const index = res.findIndex((_) => _.year === 11);

  const subject = res[index];
  expect(subject).toHaveProperty('tiers');

  if (!('tiers' in subject)) {
    throw new Error('No subjects found');
  }

  if (!subject.tiers) {
    // this is entirely for TS and red snakes, because if the code got here,
    // it means the test directly prior isn't working - i.e. stopping the code
    throw new Error('No tiers found');
  }

  const slugs = new Set(
    subject.tiers[0].units.map((_) => (_ as UnitWithoutOptions).unitSlug),
  );
  expect(slugs.size).toBeGreaterThan(0);
  expect(slugs.size).toBe(subject.tiers[0].units.length);
});

test('sequence with unit optionality', async () => {
  const { caller } = authedCaller();
  const slug = 'english-primary';
  const res = await caller.getSequences.getSequenceUnits({
    sequence: slug,
    year: 3,
  });

  const units = (res[0] as YearSequence).units;

  // const units = subject.units;
  const optional = units.find((unit) => {
    if ('unitOptions' in unit) {
      return true;
    }
  }) as UnitWithOptions | undefined;

  if (!optional) {
    expect.fail('No optional units found');
  }

  // we're using King Tut in this example, it kinda breaks if not
  expect(optional.unitTitle).toContain('King Tut');

  expect(optional).toHaveProperty('unitOptions');
  expect(optional.unitOptions.length).toBe(2);
});

test('cannot access RSHE sequence contents', async () => {
  const { caller } = authedCaller();

  await expect(
    async () =>
      await caller.getSequences.getSequenceUnits({
        sequence: 'rshe-pshe-primary',
      }),
  ).rejects.toThrowError();

  await expect(
    async () =>
      await caller.getSequences.getSequenceUnits({
        sequence: 'rshe-pshe-secondary',
      }),
  ).rejects.toThrowError();

  await expect(
    async () =>
      await caller.getAssets.getSequenceAssets({
        sequence: 'rshe-pshe-primary',
      }),
  ).rejects.toThrowError();

  await expect(
    async () =>
      await caller.getAssets.getSequenceAssets({
        sequence: 'rshe-pshe-secondary',
      }),
  ).rejects.toThrowError();

  await expect(
    async () =>
      await caller.getQuestions.getQuestionsForSequence({
        sequence: 'rshe-pshe-primary',
      }),
  ).rejects.toThrowError();

  await expect(
    async () =>
      await caller.getQuestions.getQuestionsForSequence({
        sequence: 'rshe-pshe-secondary',
      }),
  ).rejects.toThrowError();
});

test('new structure', async () => {
  const { caller } = authedCaller();

  const res = await caller.getSequences.getSequenceUnits({
    sequence: 'science-secondary-aqa',
  });

  const year11 = res.find((_) => _.year === 11);

  if (!year11) {
    throw new Error('No year 11 found');
  }

  expect(year11.year).toBe(11);

  const examSubjects = (year11 as yearSequenceKS4WithExamSubjects).examSubjects;
  expect(Array.isArray(examSubjects)).toBe(true);

  if (!('tiers' in examSubjects[0])) {
    throw new Error('Expected to find tiers on exam subjects');
  }

  const tiers = examSubjects[0].tiers[0];
  expect(tiers.tier).toBe('foundation');

  const unitsWithCategories = tiers.units
    .map((unit) => {
      if ('categories' in unit && unit.categories) {
        return unit.categories.map((category) => category.categoryTitle);
      }
      return -1;
    })
    .filter((_) => _ !== -1)
    .flat();

  expect(unitsWithCategories.length).toBeGreaterThan(0);
  expect(unitsWithCategories).not.toContain(undefined);
});

test('new structure with options', async () => {
  const { caller } = authedCaller();

  const res = await caller.getSequences.getSequenceUnits({
    sequence: 'english-secondary-aqa',
    year: 11,
  });

  expect(res).toBeTruthy();
});

test('that subject programme override is reflected in unit', async () => {
  const { caller } = authedCaller();

  const res = await caller.getSequences.getSequenceUnits({
    sequence: 'computing-secondary-aqa',
    year: 11,
  });

  const resData = res[0];

  if (!resData || !('examSubjects' in resData)) {
    throw new Error('No exam subject found');
  }

  expect(resData.examSubjects[0].examSubjectTitle).toBe('Computer Science');
});
