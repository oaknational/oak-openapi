import { expect, test } from 'vitest';
import { makeCaller } from './helper';
import { getLatestVersion } from '~/lib/handlers/changelog';

test('change log', async () => {
  const caller = makeCaller();

  const res = await caller.changelog.latest();

  expect(res.version).toEqual(getLatestVersion('1'));
});
