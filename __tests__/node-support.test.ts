import { expect, test } from 'vitest';

test('ensure toSorted is available', () => {
  const arr = [{ a: 2 }, { a: 1 }, { a: 3 }];
  const sorted = arr.toSorted((x, y) => x.a - y.a);
  expect(sorted).toEqual([{ a: 1 }, { a: 2 }, { a: 3 }]);
});
