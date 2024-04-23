import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { OpenApiMeta } from 'trpc-openapi';
import { ZodError } from 'zod';

import type { Context } from '~/lib/context';

export const t = initTRPC
  .context<Context>()
  .meta<OpenApiMeta>()
  .create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
      console.error('trpc error', { shape, error });

      // this shouldn't happen before landing in production, but
      // by putting this ahead of the generic catch all ISE500 handler
      // we can get a clue as to what the actual error is

      if (error.cause instanceof ZodError) {
        return {
          ...shape,
          data: {
            ...shape.data,
            zodError: error.cause.flatten(),
          },
        };
      }

      /**
       * If it's an INTERNAL_SERVER_ERROR, chances are it's
       * unhandled and we potentially don't want to return
       * the full stack to the client
       */
      if (error.code === 'INTERNAL_SERVER_ERROR') {
        // if dev, surface all the errors to our hard-working developers
        if (process.env.NODE_ENV === 'development') {
          return {
            ...shape,
            message: JSON.stringify({ error, shape }),
            data: {
              ...shape.data,
              stack: undefined,
            },
          };
        }

        return {
          ...shape,
          message: 'Internal server error',
          data: {
            ...shape.data,
            stack: undefined,
          },
        };
      }

      if (error.code === 'BAD_REQUEST' && error.cause instanceof ZodError) {
        return {
          ...shape,
          data: {
            ...shape.data,
            zodError: error.cause.flatten(),
          },
        };
      }

      return {
        ...shape,
        data: {
          ...shape.data,
          zodError: null,
        },
      };
    },
  });

export const router = t.router;
export const publicProcedure = t.procedure;
export const mergeRouters = t.mergeRouters;
