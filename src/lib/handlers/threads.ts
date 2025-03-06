import { protectedProcedure } from '~/lib/protect';
import { router } from '~/lib/trpc';
import { z } from 'zod';
import { getClient, gql, ThreadWithUnits } from '../owaClient';
import { TRPCError } from '@trpc/server';

const threadSchema = z.object({
  title: z.string(),
  slug: z.string(),
});

const unitListSchema = z.array(
  z.object({
    unitTitle: z.string(),
    unitSlug: z.string(),
    unitOrder: z.number(),
  }),
);

export const getThreads = router({
  getAllThreads: protectedProcedure
    .meta({
      openapi: {
        tags: ['lists'],
        method: 'GET',
        path: '/threads',
        description: 'Get all threads that can be used as sequence filters.',
        example: {
          response: [
            {
              title: 'A Midsummer Night’s Dream',
              slug: 'a-midsummer-nights-dream-72',
            },
          ],
        },
      },
    })
    .output(z.array(threadSchema))
    .input(z.void())
    .query(async () => {
      const client = getClient();

      const query = gql`
        query {
          threads(where: { _state: { _eq: "published" } }) {
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
        description: 'Get all units for a specific thread filter.',
        example: {
          response: [
            {
              unitTitle:
                "A Midsummer Night's Dream, Shakespeare (Introduction and Act 1)",
              unitSlug:
                'a-midsummer-nights-dream-shakespeare-introduction-and-act-1-2912',
              unitOrder: 1,
            },
            {
              unitTitle: "A Midsummer Night's Dream, Shakespeare (Act 2)",
              unitSlug: 'a-midsummer-nights-dream-shakespeare-act-2-3c74',
              unitOrder: 2,
            },
          ],
          request: {
            threadSlug: 'a-midsummer-nights-dream-72',
          },
        },
      },
    })
    .output(unitListSchema)
    .input(
      z.object({
        threadSlug: z.string(),
      }),
    )
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
