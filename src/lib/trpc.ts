import { initTRPC } from '@trpc/server';
import util from 'node:util';
import superjson from 'superjson';
import type { OpenApiMeta } from 'trpc-to-openapi';
import { ZodError } from 'zod';

import type { Context } from '@/lib/context';

export class HTTPStatusError extends Error {
  code: string;
  statusCode: number;
  cause?: string;

  constructor(opts: {
    code: string;
    message: string;
    statusCode: number;
    cause?: string;
  }) {
    super(opts.message);
    this.code = opts.code;
    this.statusCode = opts.statusCode || 500;
    this.name = 'HTTPStatusError';
    this.cause = opts.cause;
  }
}

export const t = initTRPC
  .context<Context>()
  .meta<OpenApiMeta>()
  .create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
      if (process.env.NODE_ENV !== 'development') {
        // let's not air our dirty laundry in production
        delete shape?.data?.stack;
      }

      if (error.code === 'INTERNAL_SERVER_ERROR') {
        if (error.cause && error.cause instanceof ZodError) {
          const cause = error.cause;

          console.error(
            util.inspect(
              {
                type: 'ZodError',
                errors: cause.issues,
                trpcPath: shape.data.path,
              },
              { depth: null, colors: true },
            ),
          );
        } else {
          console.error('trpc error', {
            code: error.code,
            message: shape.message,
            trpcPath: shape.data.path,
            line: shape.data.stack?.split('\n')[1].trim(),
          });
        }
      } else {
        console.error('trpc error', {
          code: error.code,
          message: shape.message,
          trpcPath: shape.data.path,
        });
      }

      // this shouldn't happen before landing in production, but
      // by putting this ahead of the generic catch all ISE500 handler
      // we can get a clue as to what the actual error is

      if (error.cause instanceof ZodError) {
        return {
          ...shape,
          data: {
            ...shape.data,
            zodError: error.cause.issues,
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
            ...error.cause,
            message: shape.message,
            data: {
              ...shape.data,
              stack: shape.data.stack?.split('\n')[1].trim(),
            },
          };
        }

        return {
          ...error.cause,
          message: shape.message,
        };
      }

      if (error.code === 'BAD_REQUEST' && error.cause instanceof ZodError) {
        return {
          ...shape,
          data: {
            ...shape.data,
            zodError: error.cause.issues,
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
export const createCallerFactory = t.createCallerFactory;
