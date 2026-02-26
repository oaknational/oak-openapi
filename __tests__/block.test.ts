import { expect, test } from 'vitest';
import { extractCauseFromTRPCError, makeCaller } from './helper';
import { TRPCError } from '@trpc/server';
import assetBlockedLessons from '@/lib/queryGateData/assets/blockedLessons.json' with { type: 'json' };
import supportedLessons from '@/lib/queryGateData/copyright/supportedLessons.json' with { type: 'json' };

test('blocked unit by copyright', async () => {
  const caller = makeCaller({
    user: 1,
  });

  try {
    await caller.getUnits.getUnit({
      unit: 'choices-risks-and-rewards',
    });
    expect.fail('Expected to throw an error for blocked content');
  } catch (e) {
    const error = e as TRPCError;
    expect(error instanceof TRPCError).toBe(true);
    expect(error.code).toBe('BAD_REQUEST');
    expect(extractCauseFromTRPCError(error)).toContain(
      'Error: Subject is copyright protected',
    );
  }
});

test('blocked lessons do not have assets marked as available', async () => {
  const caller = makeCaller({
    user: 1,
  });

  // get the intersection of supportedLessons that are also assetBlockedLessons
  const blockedLessons = assetBlockedLessons.filter((lesson) =>
    supportedLessons.includes(lesson),
  );

  const lesson =
    blockedLessons[Math.floor(Math.random() * blockedLessons.length)];

  const res = await caller.getLessons.getLesson({
    lesson,
  });
  expect(res.downloadsAvailable).toBe(false);
});

test('blocked lesson by copyright', async () => {
  const caller = makeCaller({
    user: 1,
  });

  try {
    await caller.getLessons.getLesson({
      lesson: 'comparing-identity-in-pot-the-jewellery-maker-and-homing',
    });
    expect.fail('Expected to throw an error for blocked content');
  } catch (e) {
    const error = e as TRPCError;
    expect(error instanceof TRPCError).toBe(true);
    expect(error.code).toBe('BAD_REQUEST');
    expect(extractCauseFromTRPCError(error)).toContain(
      'Error: Subject is copyright protected',
    );
  }
});
