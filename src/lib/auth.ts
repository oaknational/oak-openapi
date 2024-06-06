import { TRPCError } from '@trpc/server';
import { t } from '~/lib/trpc';

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const { user } = ctx;

  if (!user) {
    throw new TRPCError({
      message: 'API token not provided or invalid',
      code: 'UNAUTHORIZED',
    });
  }

  return next();
});
