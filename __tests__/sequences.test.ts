import { expect, test } from 'vitest';
import { authedCaller } from './helper';
import {
  UnitWithOptions,
  UnitWithoutOptions,
  YearSequence,
  yearSequenceKS4WithExamSubjects,
} from '@/lib/handlers/sequences/types';

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

  expect(year1.units[0].threads?.length).toBeGreaterThan(0);

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

test('sequence without exam board does not duplicate units within (subject, tier)', async () => {
  const { caller } = authedCaller();
  // `science-secondary` (no exam board) pulls rows across all exam boards.
  // Each exam board has its own copy of a given unit, so naive concatenation
  // leaves the same unit appearing 3× inside the same (subject, tier) combo.
  const res = await caller.getSequences.getSequenceUnits({
    sequence: 'science-secondary',
    year: '11',
  });

  const year11 = res.find(
    (_) => _.year === 11,
  ) as yearSequenceKS4WithExamSubjects;

  if (!year11 || !('examSubjects' in year11)) {
    throw new Error('Expected examSubjects on year 11');
  }

  const dupesWithinSubjectTier: string[] = [];
  for (const examSubject of year11.examSubjects) {
    if (!('tiers' in examSubject)) continue;
    for (const tier of examSubject.tiers) {
      const slugs = tier.units.map((u) =>
        'unitSlug' in u ? u.unitSlug : u.unitTitle,
      );
      const seen = new Set<string>();
      for (const slug of slugs) {
        if (seen.has(slug)) {
          dupesWithinSubjectTier.push(
            `${examSubject.examSubjectSlug}/${tier.tierSlug}/${slug}`,
          );
        }
        seen.add(slug);
      }
    }
  }

  expect(dupesWithinSubjectTier).toStrictEqual([]);

  // And the unit the bug was first reported against should be present exactly
  // once per (subject, tier) combination it lives in.
  const biomassOccurrences: string[] = [];
  for (const examSubject of year11.examSubjects) {
    if (!('tiers' in examSubject)) continue;
    for (const tier of examSubject.tiers) {
      for (const unit of tier.units) {
        if (
          'unitSlug' in unit &&
          unit.unitSlug === 'biomass-transfer-food-security-and-biodiversity'
        ) {
          biomassOccurrences.push(
            `${examSubject.examSubjectSlug}/${tier.tierSlug}`,
          );
        }
      }
    }
  }

  expect(new Set(biomassOccurrences).size).toBe(biomassOccurrences.length);
});

test('sequence without exam board exposes examBoards on each unit', async () => {
  const { caller } = authedCaller();
  const res = await caller.getSequences.getSequenceUnits({
    sequence: 'science-secondary',
    year: '11',
  });

  const year11 = res.find(
    (_) => _.year === 11,
  ) as yearSequenceKS4WithExamSubjects;

  if (!year11 || !('examSubjects' in year11)) {
    throw new Error('Expected examSubjects on year 11');
  }

  // `biomass-transfer-food-security-and-biodiversity` is published across all
  // three KS4 science exam boards, so when we don't pin to one it should list
  // them all on the unit.
  const biomassUnit = year11.examSubjects
    .flatMap((es) => ('tiers' in es ? es.tiers : []))
    .flatMap((tier) => tier.units)
    .find(
      (u) =>
        'unitSlug' in u &&
        u.unitSlug === 'biomass-transfer-food-security-and-biodiversity',
    );

  if (!biomassUnit) {
    throw new Error('Expected to find the biomass unit');
  }

  expect(biomassUnit.examBoards).toBeDefined();
  const boardSlugs = (biomassUnit.examBoards ?? []).map((b) => b.slug).sort();
  expect(boardSlugs).toStrictEqual(['aqa', 'edexcel', 'ocr']);
});

test('sequence pinned to an exam board omits examBoards from units', async () => {
  const { caller } = authedCaller();
  const res = await caller.getSequences.getSequenceUnits({
    sequence: 'science-secondary-aqa',
    year: '11',
  });

  const year11 = res.find(
    (_) => _.year === 11,
  ) as yearSequenceKS4WithExamSubjects;

  if (!year11 || !('examSubjects' in year11)) {
    throw new Error('Expected examSubjects on year 11');
  }

  const allUnits = year11.examSubjects
    .flatMap((es) => ('tiers' in es ? es.tiers : []))
    .flatMap((tier) => tier.units);

  expect(allUnits.length).toBeGreaterThan(0);
  for (const unit of allUnits) {
    expect(unit.examBoards).toBeUndefined();
  }
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
          return subject.tiers.map((tier) => tier.tierSlug);
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
    year: '3',
  });

  const units = (res[0] as YearSequence).units;

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

test('can access RSHE sequence contents', async () => {
  const { caller } = authedCaller();

  await expect(
    caller.getSequences.getSequenceUnits({
      sequence: 'rshe-pshe-primary',
    }),
  ).resolves.not.toThrowError();

  await expect(
    caller.getSequences.getSequenceUnits({
      sequence: 'rshe-pshe-secondary',
    }),
  ).resolves.not.toThrowError();

  await expect(
    caller.getAssets.getSequenceAssets({
      sequence: 'rshe-pshe-primary',
    }),
  ).resolves.not.toThrowError();

  await expect(
    caller.getAssets.getSequenceAssets({
      sequence: 'rshe-pshe-secondary',
    }),
  ).resolves.not.toThrowError();

  await expect(
    caller.getQuestions.getQuestionsForSequence({
      sequence: 'rshe-pshe-primary',
    }),
  ).resolves.not.toThrowError();

  await expect(
    caller.getQuestions.getQuestionsForSequence({
      sequence: 'rshe-pshe-secondary',
    }),
  ).resolves.not.toThrowError();
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
  expect(tiers.tierSlug).toBe('foundation');

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
    year: '11',
  });

  expect(res).toBeTruthy();
});

test('that subject programme override is reflected in unit', async () => {
  const { caller } = authedCaller();

  const res = await caller.getSequences.getSequenceUnits({
    sequence: 'computing-secondary-aqa',
    year: '11',
  });

  const resData = res[0];

  if (!resData || !('examSubjects' in resData)) {
    throw new Error('No exam subject found');
  }

  expect(resData.examSubjects[0].examSubjectTitle).toBe('Computer Science');
});

test(`swimming is "all-years" in PE`, async () => {
  const { caller } = authedCaller();

  const res = await caller.getSequences.getSequenceUnits({
    sequence: 'physical-education-primary',
  });

  const first = res[0] as YearSequence;

  expect(first.year).toBe('all-years');
  expect(first).toHaveProperty('title');
  expect(first.units.length).toBeGreaterThan(0);
});

test(`there is not "all-years" in PE secondary`, async () => {
  const { caller } = authedCaller();

  const res = await caller.getSequences.getSequenceUnits({
    sequence: 'physical-education-secondary',
  });

  const first = res[0];

  expect(first.year).not.toBe('all-years');
});

test('cannot access Financial Education sequence contents', async () => {
  const { caller } = authedCaller();

  await expect(
    async () =>
      await caller.getSequences.getSequenceUnits({
        sequence: 'financial-education',
      }),
  ).rejects.toThrowError();

  await expect(
    async () =>
      await caller.getSequences.getSequenceUnits({
        sequence: 'financial-education',
      }),
  ).rejects.toThrowError();

  await expect(
    async () =>
      await caller.getAssets.getSequenceAssets({
        sequence: 'financial-education',
      }),
  ).rejects.toThrowError();

  await expect(
    async () =>
      await caller.getAssets.getSequenceAssets({
        sequence: 'financial-education',
      }),
  ).rejects.toThrowError();

  await expect(
    async () =>
      await caller.getQuestions.getQuestionsForSequence({
        sequence: 'financial-education',
      }),
  ).rejects.toThrowError();

  await expect(
    async () =>
      await caller.getQuestions.getQuestionsForSequence({
        sequence: 'financial-education',
      }),
  ).rejects.toThrowError();
});
