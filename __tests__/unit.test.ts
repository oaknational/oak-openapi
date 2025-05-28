import { expect, test } from 'vitest';
import { makeCaller, makeRes } from './helper';
import type {
  Unit,
  UnitWithOptions,
  YearSequence,
} from '~/lib/handlers/sequences';

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
