import { expect, test } from 'vitest';
import { extractCauseFromTRPCError, makeCaller } from './helper';
import { TRPCError } from '@trpc/server';

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
      'Error: Subject is blocked',
    );
  }
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
      'Error: Subject is blocked',
    );
  }
});
