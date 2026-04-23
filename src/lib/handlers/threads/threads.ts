import { protectedProcedure } from '@/lib/protect';
import { router } from '@/lib/trpc';
import * as z from 'zod/v4';
import type { ThreadView, ThreadWithUnits } from '@/lib/owaClient';
import { getClient, gql, threadView } from '@/lib/owaClient';
import { TRPCError } from '@trpc/server';
import {
  allThreadsResponseOpenAPISchema,
  threadUnitsRequestOpenAPISchema,
  threadUnitsResponseOpenAPISchema,
} from '@/lib/zod-openapi/generated/threads';
import { errorResponses } from '@/lib/errorResponses';

export const getThreads = router({
  getAllThreads: protectedProcedure
    .meta({
      openapi: {
        tags: ['lists'],
        method: 'GET',
        summary: 'All threads',
        path: '/threads',
        errorResponses,
        description: `Use this when you want the catalogue of every thematic thread across Oak's curricula. Threads signpost groups of units that build a common body of knowledge over time and are a key part of how sequences are constructed.

Returns all threads with published units, sorted alphabetically by title, each with 'title', 'slug', and 'unitCount'.

Do not use this for:
- The units inside a specific thread (use GET /threads/{threadSlug}/units)`,
      },
    })
    .output(allThreadsResponseOpenAPISchema)
    .input(z.void())
    .query(async () => {
      const client = getClient();

      const query = gql`
        query {
          ${threadView}(where: { units_count: { _gt: 0 } }) {
            title
            slug
            units_count
          }
        }
      `;

      const res = await client.request(query);
      const threads = (res as ThreadView)[threadView];

      return threads
        .sort((a, b) => a.title.localeCompare(b.title))
        .map(({ title, slug, units_count }) => ({
          title,
          slug,
          unitCount: units_count,
        }));
    }),
  getThreadUnits: protectedProcedure
    .meta({
      openapi: {
        tags: ['lists'],
        method: 'GET',
        path: '/threads/{threadSlug}/units',
        summary: 'Units in a thread',
        description: `Use this when you want every unit that belongs to a thematic thread — a cross-subject or longitudinal strand such as "number and place value" or "scientific method".

Returns units in thread order, each with 'unitTitle', 'unitSlug', and 'unitOrder'. Threads link units that build a common body of knowledge over time.

Do not use this for:
- The catalogue of threads themselves (use GET /threads)
- Units in a curriculum sequence rather than a thread (use GET /sequences/{sequence}/units)
- A single unit's detail (use GET /units/{unit}/summary)

Example slug: 'threadSlug=number-and-place-value'`,
        errorResponses,
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
