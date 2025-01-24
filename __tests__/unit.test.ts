import { expect, test } from 'vitest';
import { makeCaller, makeRes } from './helper';
import { SequenceUnits, Unit, UnitOptions } from '~/lib/handlers/sequences';

test('get cycle 2 (2024-2025) unit', async () => {
  const caller = makeCaller({
    user: 1,
  });

  const res = await caller.getUnits.getUnit({
    unit: 'ceramics-cake-culture',
  });

  expect(Array.isArray(res)).toBe(false);
});

async function getUnitOptionsForSequence(sequence: string, year: number) {
  const caller = makeCaller({
    user: 1,
  });

  const res = (await caller.getSequences.getSequenceUnits({
    sequence,
    year,
  })) as SequenceUnits;

  const data = res[0];
  let units: Unit[] = [];

  if (!data) {
    throw new Error(`No units found on sequence ${sequence}`);
  }

  if ('subjects' in data) {
    units = data.subjects
      .map((subject) => {
        if ('units' in subject) {
          return subject.units as Unit[];
        }
        return [];
      })
      .flat();
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

  return (found as UnitOptions).unitOptions;
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

  const unit = unitOptions[0].unitSlug;
  const res = await caller.getUnits.getUnit({ unit });
  expect(res).toHaveProperty('unitSlug');
  expect(res.unitSlug).toBe(unit);
});
