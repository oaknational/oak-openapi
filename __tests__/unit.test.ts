import { expect, test } from 'vitest';
import { makeCaller, makeRes } from './helper';
import type {
  Unit,
  UnitWithOptions,
  YearSequence,
} from '@/lib/handlers/sequences/types';
import { unitSummaryRequestSchema } from '@/lib/handlers/units/schemas/unitSummaryRequest.schema';

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

test('unit summary request validates programme-factor filters', () => {
  expect(() =>
    unitSummaryRequestSchema.parse({
      unit: 'programming-subroutines',
      examBoard: 'aqa',
      pathway: 'gcse',
      tier: 'foundation',
    }),
  ).not.toThrow();

  expect(() =>
    unitSummaryRequestSchema.parse({
      unit: 'programming-subroutines',
      examBoard: 'not-a-board',
    }),
  ).toThrow();
});

test('ambiguous unit exposes additional programme factors', async () => {
  const caller = makeCaller({
    user: 1,
  });

  const res = await caller.getUnits.getUnit({
    unit: 'programming-subroutines',
  });

  expect(res.unitSlug).toBe('programming-subroutines');
  expect(
    res.additionalProgrammeFactors?.examBoards?.map((_) => _.slug).sort(),
  ).toStrictEqual(['aqa', 'ocr']);
});

test('programme-factor filters disambiguate unit summary variants', async () => {
  const caller = makeCaller({
    user: 1,
  });

  const aqa = await caller.getUnits.getUnit({
    unit: 'programming-subroutines',
    examBoard: 'aqa',
    pathway: 'gcse',
  });
  const ocr = await caller.getUnits.getUnit({
    unit: 'programming-subroutines',
    examBoard: 'ocr',
    pathway: 'gcse',
  });
  const foundation = await caller.getUnits.getUnit({
    unit: 'biomass-transfer-food-security-and-biodiversity',
    examBoard: 'aqa',
    tier: 'foundation',
  });
  const higher = await caller.getUnits.getUnit({
    unit: 'biomass-transfer-food-security-and-biodiversity',
    examBoard: 'aqa',
    tier: 'higher',
  });

  expect(aqa.unitSlug).toBe('programming-subroutines');
  expect(ocr.unitSlug).toBe('programming-subroutines');
  expect(aqa.unitLessons.map((l) => l.lessonSlug)).not.toStrictEqual(
    ocr.unitLessons.map((l) => l.lessonSlug),
  );
  expect(foundation.unitSlug).toBe(
    'biomass-transfer-food-security-and-biodiversity',
  );
  expect(higher.unitSlug).toBe(
    'biomass-transfer-food-security-and-biodiversity',
  );
});

/** notes
 * Examboard information on units:
 * - poetry-anthology-first-study-1482 - only eduqas
 * - modern-text-first-study-4896 - aqa and edexcel
 * - myths-and-legends-re-told-poetry-and-short-stories - none, therefore all
 **/
