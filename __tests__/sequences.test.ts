import { expect, test } from 'vitest';
import { authedCaller } from './helper';
import { UnitNoOptions, UnitOptions } from '~/lib/handlers/sequences';

test('sequence with subjects', async () => {
  const { caller } = authedCaller();
  const slug = 'english-primary';
  const res = await caller.getSequences.getSequenceUnits({ sequence: slug });

  expect(res.length).toBe(6);
  expect(res.map((_) => _.year)).toStrictEqual([1, 2, 3, 4, 5, 6]);

  expect(res[0]).toHaveProperty('subjects');

  if (!('subjects' in res[0])) {
    throw new Error('No subjects found');
  }
  expect(res[0].subjects.length).toBeGreaterThan(1);
  const subject = res[0].subjects.find((_) => {
    return _.subjectSlug === 'handwriting';
  });

  expect(subject).toHaveProperty('units');

  if (!subject || !('units' in subject)) {
    throw new Error('No subjects found');
  }

  // expect(subject.units.map((_) => _.unitOrder).slice(0, 3)).toStrictEqual([
  //   3, 4, 5,
  // ]);

  const slugs = new Set(
    subject.units?.map((_) => (_ as UnitNoOptions).unitSlug),
  );
  expect(slugs.size).toBe(subject.units?.length);
});

test('sequence with subjects & tiers', async () => {
  const { caller } = authedCaller();
  const slug = 'science-secondary-aqa';
  const res = await caller.getSequences.getSequenceUnits({ sequence: slug });

  expect(res.length).toBe(5);
  expect(res.map((_) => _.year)).toStrictEqual([7, 8, 9, 10, 11]);

  const index = res.findIndex((_) => _.year === 11);

  expect(res[index]).toHaveProperty('subjects');

  if (!('subjects' in res[index])) {
    throw new Error('No subjects found');
  }
  expect(res[index].subjects.map((_) => _.subjectSlug)).toContain('biology');
  expect(res[index].subjects.map((_) => _.subjectSlug)).toContain('physics');
  expect(res[index].subjects.map((_) => _.subjectSlug)).toContain('chemistry');
  expect(res[index].subjects.map((_) => _.subjectSlug)).toContain(
    'combined-science',
  );

  expect(res[index].subjects.map((_) => _.subjectTitle)).toContain(
    'Combined science',
  );
  expect(res[index].subjects[0]).toHaveProperty('tiers');

  if (!('tiers' in res[index].subjects[0])) {
    throw new Error('No subjects found');
  }

  const tier = res[index].subjects[0].tiers?.[0];

  if (!tier) {
    throw new Error('No tier found');
  }

  expect(tier.units.map((_) => _.unitOrder).slice(0, 3)).toStrictEqual([
    1, 2, 3,
  ]);

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

  if (!('subjects' in res[0])) {
    throw new Error('No subjects found');
  }

  const subject = res[0].subjects.find(
    (_) => _.subjectSlug === 'reading-writing-and-oracy',
  );

  expect(subject).toBeTruthy();

  // this is more nonsense from typescript otherwise I get red snakes
  if (!subject || !('units' in subject)) {
    throw new Error('No subjects found');
  }

  const units = subject.units;
  const optional = units.find((unit) => {
    if ('unitOptions' in unit) {
      return true;
    }
  }) as UnitOptions | undefined;

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
