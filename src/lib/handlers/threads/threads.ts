import { protectedProcedure } from '@/lib/protect';
import { router } from '@/lib/trpc';
import * as z from 'zod/v4';
import type { SequenceView, ThreadView } from '@/lib/owaClient';
import {
  getClient,
  gql,
  sequenceView,
  sequenceViewWhereInput,
  threadView,
} from '@/lib/owaClient';
import { TRPCError } from '@trpc/server';
import {
  allThreadsResponseOpenAPISchema,
  threadUnitsRequestOpenAPISchema,
  threadUnitsResponseOpenAPISchema,
} from '@/lib/zod-openapi/generated/threads';
import { errorResponses } from '@/lib/errorResponses';
// import {
//   getUnitProgrammeFactorsFromSequence,
//   type UnitProgrammeFactors,
// } from '@/lib/handlers/unitProgrammeFactors';

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
          ${threadView} {
            title
            slug
            unit_count
          }
        }
      `;

      const res = await client.request(query);
      const threads = (res as ThreadView)[threadView];

      return threads
        .sort((a, b) => a.title.localeCompare(b.title))
        .map(({ title, slug, unit_count }) => ({
          title,
          slug,
          unitCount: unit_count,
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

      const threadQuery = gql`
        query ($threadSlug: String!) {
          ${threadView}(
            where: {
              slug: { _eq: $threadSlug }
            }
          ) {
            slug
          }
        }
      `;

      const threadRes = await client.request(threadQuery, { threadSlug });
      const threads = (threadRes as ThreadView)[threadView];

      if (!threads.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Thread not found',
        });
      }

      const query = gql`
        query getThreadUnits($where: ${sequenceViewWhereInput}) {
          ${sequenceView}(
            where: $where
          ) {
            slug
            title
            # examboard
            # examboard_slug
            # pathway
            # pathway_slug
            # tier
            # tier_slug
          }
        }
      `;

      const where = {
        non_curriculum: { _eq: false },
        state: { _eq: 'published' },
        threads: {
          _contains: [{ slug: threadSlug }],
        },
      };

      const res: SequenceView = await client.request(query, { where });

      const units = res[sequenceView];

      // The sequence view is row-per-(unit, programme variant), so the same
      // unit slug can appear multiple times across exam boards / tiers /
      // pathways. We currently surface one entry per unit slug and leave the
      // programme-factor fields disabled until the API is ready to expose them.
      const seen = new Set<string>();
      const result: {
        unitSlug: string;
        unitTitle: string;
        // programmeFactors?: UnitProgrammeFactors;
      }[] = [];

      for (const unit of units) {
        // const programmeFactors = getUnitProgrammeFactorsFromSequence(unit);

        if (seen.has(unit.slug)) {
          // const existing = result.find((r) => r.unitSlug === unit.slug);
          // if (existing) {
          //   existing.programmeFactors = {
          //     ...existing.programmeFactors,
          //     ...programmeFactors,
          //   };
          // }
          continue;
        }
        seen.add(unit.slug);

        result.push({
          unitSlug: unit.slug,
          unitTitle: unit.title,
          // ...(programmeFactors ? { programmeFactors } : {}),
        });
      }

      return result;
    }),
});
