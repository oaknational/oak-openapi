import { expect, test } from 'vitest';
import { makeCaller, makeRes } from './helper';
import type {
  Unit,
  UnitWithOptions,
  YearSequence,
} from '@/lib/handlers/sequences/types';

test('get cycle 2 (2024-2025) unit', async () => {
  const caller = makeCaller({
    user: 1,
  });

  const res = await caller.getUnits.getUnit({
    unit: 'ceramics-cake-culture',
  });

  expect(Array.isArray(res)).toBe(false);
  expect(res).toHaveProperty('unitSlug');
});

async function getUnitOptionsForSequence(sequence: string, year: number) {
  const caller = makeCaller({
    user: 1,
  });

  const res = (await caller.getSequences.getSequenceUnits({
    sequence,
    year: year.toString(),
  })) as YearSequence[];

  const data = res[0];
  let units: Unit[] = data.units;

  if (!data) {
    throw new Error(`No units found on sequence ${sequence}`);
  }

  if ('units' in data) {
    units = data.units;
  }

  if (!units) {
    throw new Error(`No units found on sequence: ${sequence}`);
  }

  const found = units.find((unit) => {
    if ('unitOptions' in unit) {
      return unit.unitOptions.length > 0;
    }
  });

  if (!found) {
    throw new Error(`No unit options found for sequence ${sequence}`);
  }

  return (found as UnitWithOptions).unitOptions;
}

test('optionality unit 2023-24 cohort', async () => {
  const caller = makeCaller({
    user: 1,
  });

  const unitOptions = await getUnitOptionsForSequence('english-primary', 3);

  const unit = unitOptions[0].unitSlug;
  const res = await caller.getUnits.getUnit({ unit });
  expect(res).toHaveProperty('unitSlug');
  expect(res.unitSlug).toBe(unit);
});

test('optionality unit 2024-25 cohort', async () => {
  const request = makeRes();
  const caller = makeCaller({
    user: 1,
    request,
  });

  const unitOptions = await getUnitOptionsForSequence('art-secondary', 10);

  // check all the units
  for (const { unitSlug: unit } of unitOptions) {
    const res = await caller.getUnits.getUnit({ unit });
    expect(res).toHaveProperty('unitSlug');
    expect(res.unitSlug).toBe(unit);
  }
});

test('threads are present', async () => {
  const caller = makeCaller({
    user: 1,
  });

  const res = await caller.getUnits.getUnit({
    unit: 'ceramics-cake-culture',
  });

  expect(res.threads?.length).toBeGreaterThan(0);
});

/** notes
 * Examboard information on units:
 * - poetry-anthology-first-study-1482 - only eduqas
 * - modern-text-first-study-4896 - aqa and edexcel
 * - myths-and-legends-re-told-poetry-and-short-stories - none, therefore all
 **/

test('unit with no programme factors omits programmeFactors', async () => {
  const caller = makeCaller({
    user: 1,
  });

  const res = await caller.getUnits.getUnit({
    unit: 'simple-compound-and-adverbial-complex-sentences',
  });

  expect(res).toHaveProperty('unitSlug');
  expect(res.programmeFactors).toBeUndefined();
});

test('unit with multiple variants returns programmeFactors deterministically', async () => {
  const caller = makeCaller({
    user: 1,
  });

  // programming-subroutines exists for AQA + OCR; without a filter the
  // deterministic sort should always pick the same one.
  const first = await caller.getUnits.getUnit({
    unit: 'programming-subroutines',
  });
  const second = await caller.getUnits.getUnit({
    unit: 'programming-subroutines',
  });

  expect(first.programmeFactors).toBeDefined();
  expect(first.programmeFactors?.examBoard?.slug).toBe(
    second.programmeFactors?.examBoard?.slug,
  );
});

test('examBoard filter selects matching variant', async () => {
  const caller = makeCaller({
    user: 1,
  });

  const aqa = await caller.getUnits.getUnit({
    unit: 'programming-subroutines',
    examBoard: 'aqa',
  });
  expect(aqa.programmeFactors?.examBoard?.slug).toBe('aqa');

  const ocr = await caller.getUnits.getUnit({
    unit: 'programming-subroutines',
    examBoard: 'ocr',
  });
  expect(ocr.programmeFactors?.examBoard?.slug).toBe('ocr');

  // The two variants should expose different lesson sets.
  expect(aqa.unitLessons.map((l) => l.lessonSlug)).not.toStrictEqual(
    ocr.unitLessons.map((l) => l.lessonSlug),
  );
});

test('combined examBoard + tier filter selects matching variant', async () => {
  const caller = makeCaller({
    user: 1,
  });

  const foundation = await caller.getUnits.getUnit({
    unit: 'biomass-transfer-food-security-and-biodiversity',
    examBoard: 'aqa',
    tier: 'foundation',
  });
  expect(foundation.programmeFactors?.examBoard?.slug).toBe('aqa');
  expect(foundation.programmeFactors?.tier?.slug).toBe('foundation');

  const higher = await caller.getUnits.getUnit({
    unit: 'biomass-transfer-food-security-and-biodiversity',
    examBoard: 'aqa',
    tier: 'higher',
  });
  expect(higher.programmeFactors?.tier?.slug).toBe('higher');
});

test('unmatched programme factor returns 404', async () => {
  const caller = makeCaller({
    user: 1,
  });

  // programming-subroutines exists for AQA + OCR only, so asking for eduqas
  // should resolve to no rows and 404.
  await expect(
    caller.getUnits.getUnit({
      unit: 'programming-subroutines',
      examBoard: 'eduqas',
    }),
  ).rejects.toMatchObject({
    code: 'NOT_FOUND',
  });
});

test('invalid examBoard enum is rejected by input schema', async () => {
  const caller = makeCaller({
    user: 1,
  });

  await expect(
    caller.getUnits.getUnit({
      unit: 'simple-compound-and-adverbial-complex-sentences',
      examBoard: 'not-a-real-board',
    }),
  ).rejects.toMatchObject({
    code: 'BAD_REQUEST',
  });
});
