import { protectedProcedure } from '~/lib/protect';
import { router } from '~/lib/trpc';
import { gql } from 'graphql-request';
import { keyStageSlugs, subjectSlugs } from 'lib/keyStageAndSubjects';
import { LessonView, getClient, lessonView } from 'lib/owaClient';
import { z } from 'zod';

export const getAllKeyStageAndSubjectUnits = router({
  getAllKeyStageAndSubjectUnits: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['lists', 'units'],
        path: '/key-stages/{keyStage}/subject/{subject}/units',
        description:
          'This endpoint returns all the units (titles and slugs) that are currently available on Oak for a given subject and key stage',
        example: {
          response: [
            {
              unitTitle: 'Simple, compound and adverbial complex sentences',
              unitSlug: 'simple-compound-and-adverbial-complex-sentences',
            },
          ],
        },
      },
    })
    .input(
      z.object({
        keyStage: z.enum(keyStageSlugs as [string], {
          description: "Key stage slug to filter by, e.g. 'ks2'",
        }),
        subject: z.enum(subjectSlugs as [string], {
          description:
            "Subject slug to search by, e.g. 'science' - note that casing is important here (always lowercase)",
        }),
      }),
    )
    .output(
      z.array(
        z.object({
          unitTitle: z.string({ description: 'Unit title' }),
          unitSlug: z.string({ description: 'Unit slug' }),
          // unitOrder: z.number(), // removed for the moment
        }),
      ),
    )
    .query(async ({ input }) => {
      const keyStage = decodeURIComponent(input.keyStage);
      const subject = decodeURIComponent(input.subject);

      const view = lessonView;

      // FIXME this query is actually getting every lesson, not every unit
      // so I do some data munging to get the unique units, moreover, it's
      // kind of wasteful to do the full query
      const query = gql`
        query ($keyStage: String!, $subject: String!) {
          ${view}(
            where: {
              keyStageSlug: { _eq: $keyStage }
              subjectSlug: { _eq: $subject }
              isLegacy: { _eq: false }
            }
            order_by: { unitOrder: asc }
          ) {
            unitSlug
            unitTitle
            unitOrder
          }
        }
      `;

      const variables = {
        keyStage,
        subject,
      };

      const graphqlClient = getClient();
      const res: LessonView = await graphqlClient.request(query, variables);

      if (res[lessonView].length === 0) {
        return []; // unlikely, but sure.
      }

      const uniqueUnits = new Map<
        string,
        { unitSlug: string; unitTitle: string; unitOrder: number }
      >();

      res[lessonView].forEach(({ unitSlug, unitTitle, unitOrder }) => {
        if (!unitSlug || !unitTitle || unitOrder === undefined) {
          return;
        }
        uniqueUnits.set(unitSlug, {
          unitSlug,
          unitTitle,
          unitOrder,
        });
      });

      return Array.from(uniqueUnits.values());
    }),
});
