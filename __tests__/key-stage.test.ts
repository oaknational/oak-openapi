import { expect, test } from 'vitest';
import { makeCaller } from './helper';

test('find key stage units with optionality', async () => {
  const caller = makeCaller({
    user: 1,
  });

  const res =
    await caller.getAllKeyStageAndSubjectUnits.getAllKeyStageAndSubjectUnits({
      keyStage: 'ks2',
      subject: 'english',
    });

  expect(res).toBeTruthy();

  const year3 = res.find((unit) => unit.yearSlug === 'year-3');

  // find all the units where the slug ends with one or more numbers,
  // ie. king-tut-or-healthy-lifestyle-non-chronological-report-630
  const units = year3?.units.filter((_) => /-\d+$/.test(_.unitSlug));

  expect(units).toHaveLength(2);
});
