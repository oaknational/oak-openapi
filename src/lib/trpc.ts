import { initTRPC } from '@trpc/server';
import util from 'node:util';
import superjson from 'superjson';
import type { OpenApiMeta } from 'trpc-to-openapi';
import { ZodError } from 'zod';

import type { Context } from '@/lib/context';

const extraDebug = process.env.NODE_ENV === 'development';

export const t = initTRPC
  .context<Context>()
  .meta<OpenApiMeta>()
  .create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
      if (extraDebug) {
        if (error.code === 'INTERNAL_SERVER_ERROR') {
          if (error.cause && error.cause instanceof ZodError) {
            const cause = error.cause;

            console.error(
              'trpc error',
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
      }

      let customCause = true;

      if (
        error.cause &&
        typeof error.cause === 'object' &&
        Object.keys(error.cause).length > 0
      ) {
        customCause = false;
      }

      interface Reply {
        message: string;
        data?: {
          trace?: string;
          cause?: string;
        };
      }

      const reply: Reply = {
        message: shape.message,
        data: {},
      };

      if (reply.data) {
        if (customCause && error.cause?.toString()) {
          reply.data.cause = error.cause?.toString();
        }

        if (extraDebug && shape.data.stack && reply.data) {
          // if dev, surface all the errors to our hard-working developers
          const traceLine = shape.data.stack
            .split('\n')
            .find((_) => _.trim().startsWith('at '));

          if (traceLine) {
            reply.data.trace = traceLine.trim();
          }
        }

        if (reply.data && Object.keys(reply.data).length === 0) {
          delete reply.data;
        }
      }

      return reply;
    },
  });

export const router = t.router;
export const publicProcedure = t.procedure;
export const mergeRouters = t.mergeRouters;
export const createCallerFactory = t.createCallerFactory;
