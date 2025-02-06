import { expect, test } from 'vitest';
import { authedCaller } from './helper';
import {
  UnitNoOptions,
  UnitWithOptions,
  UnitWithSubjects,
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
        if ('subjectCategories' in _ && Array.isArray(_.subjectCategories)) {
          return _.subjectCategories.map((_) => _.subjectTitle);
        }
      })
      .flat(Infinity)
      .filter(Boolean) as string[],
  );

  expect(Array.from(subjects1).sort()).toStrictEqual(
    ['Reading, writing & oracy', 'Grammar', 'Handwriting'].sort(),
  );
});

test('sequence with subjects & tiers', async () => {
  const { caller } = authedCaller();
  const slug = 'science-secondary-aqa';
  const res = await caller.getSequences.getSequenceUnits({ sequence: slug });

  expect(res.length).toBe(5);
  expect(res.map((_) => _.year)).toStrictEqual([7, 8, 9, 10, 11]);

  const index = res.findIndex((_) => _.year === 11);
  const year11 = res[index];

  if (!year11 || !('tiers' in year11)) {
    throw new Error('No year 11 found');
  }

  // try to find subjectCategories in the units
  const subjects = new Set(
    year11.tiers
      .map(({ units }) =>
        units.map((_) => {
          if ('subjectCategories' in _ && Array.isArray(_.subjectCategories)) {
            return _.subjectCategories.map((_) => _.subjectTitle);
          }
        }),
      )
      .flat(Infinity)
      .filter(Boolean) as string[],
  );

  expect(Array.from(subjects).sort()).toStrictEqual(
    ['Biology', 'Chemistry', 'Combined science', 'Physics'].sort(),
  );

  const tier = year11.tiers[0];

  expect(
    tier.units
      .filter((unit) => 'subjectCategories' in unit)
      .map((unit) => {
        return (
          (unit as UnitWithSubjects).subjectCategories.find(
            (_: { subjectTitle: string }) => _.subjectTitle === 'Physics',
          )?.unitOrder ?? -1
        );
      })
      .filter((_) => _ !== -1),
  ).toStrictEqual([1, 2, 3, 4, 5, 6]);

  const slugs = new Set(
    tier.units.map((_): string => (_ as UnitNoOptions).unitSlug),
  );
  expect(slugs.size).toBe(tier.units.length);
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

  // expect(
  //   subject.tiers[0].units?.map((_) => _.unitOrder).slice(0, 3),
  // ).toStrictEqual([1, 2, 3]);

  const slugs = new Set(
    subject.tiers[0].units.map((_) => (_ as UnitNoOptions).unitSlug),
  );
  expect(slugs.size).toBe(subject.tiers[0].units.length);
});

test('sequence with unit optionality', async () => {
  const { caller } = authedCaller();
  const slug = 'english-primary';
  const res = await caller.getSequences.getSequenceUnits({
    sequence: slug,
    year: 3,
  });

  const units = res[0].units;

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

  const examSubjects = year11.examSubjects;
  expect(Array.isArray(examSubjects)).toBe(true);

  const tiers = examSubjects[0].tiers[0];
  expect(tiers.tier).toBe('higher');

  const unitsWithCategories = tiers.units
    .filter((unit) => 'categories' in unit)
    .flat();

  expect(unitsWithCategories.length).toBeGreaterThan(0);
});
