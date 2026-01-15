import { protectedProcedure } from '@/lib/protect';
import { router } from '@/lib/trpc';
import * as z from 'zod/v4';
import type { ThreadWithUnits } from '@/lib/owaClient';
import { getClient, gql } from '@/lib/owaClient';
import { TRPCError } from '@trpc/server';
import {
  allThreadsResponseOpenAPISchema,
  threadUnitsRequestOpenAPISchema,
  threadUnitsResponseOpenAPISchema,
} from '@/lib/zod-openapi/generated/threads';

export const getThreads = router({
  getAllThreads: protectedProcedure
    .meta({
      openapi: {
        tags: ['lists'],
        method: 'GET',
        summary: 'Threads',
        path: '/threads',
        errorResponses: [],
        description:
          'This endpoint returns an array of all threads, across all subjects. Threads signpost groups of units that link to one another, building a common body of knowledge over time. They are an important component of how Oak’s curricula are sequenced.',
      },
    })
    .output(allThreadsResponseOpenAPISchema)
    .input(z.void())
    .query(async () => {
      const client = getClient();

      const query = gql`
        query {
          threads(
            where: {
              _state: { _eq: "published" }
              thread_units_aggregate: {
                count: { arguments: [order], predicate: { _gt: 0 } }
              }
            }
          ) {
            title
            slug
          }
        }
      `;

      const { threads } = await client.request<{ threads: ThreadWithUnits[] }>(
        query,
      );

      return threads.sort((a, b) => a.title.localeCompare(b.title));
    }),
  getThreadUnits: protectedProcedure
    .meta({
      openapi: {
        tags: ['lists'],
        method: 'GET',
        path: '/threads/{threadSlug}/units',
        summary: 'Units belonging to a given thread',
        description:
          'This endpoint returns all of the units that belong to a given thread.',
        errorResponses: [],
      },
    })
    .input(threadUnitsRequestOpenAPISchema)
    .output(threadUnitsResponseOpenAPISchema)
    .query(async ({ input }) => {
      const client = getClient();
      const { threadSlug } = input;

      const query = gql`
        query ($threadSlug: String!) {
          threads(
            where: { _state: { _eq: "published" }, slug: { _eq: $threadSlug } }
          ) {
            thread_units(where: { _state: { _eq: "published" } }) {
              order
              unit {
                slug
                title
              }
            }
          }
        }
      `;

      const { threads } = await client.request<{ threads: ThreadWithUnits[] }>(
        query,
        { threadSlug },
      );

      if (!threads.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Thread not found',
        });
      }

      const { thread_units: units } = threads[0];

      return units
        .sort((a, b) => a.order - b.order)
        .map(({ unit, order }) => ({
          unitTitle: unit.title,
          unitSlug: unit.slug,
          unitOrder: order,
        }));
    }),
});
