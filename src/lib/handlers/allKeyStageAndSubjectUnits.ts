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
              yearSlug: 'year-1',
              yearTitle: 'Year 1',
              units: [
                {
                  unitSlug: 'word-class',
                  unitTitle: 'Word class ',
                  unitOrder: 1,
                },
                {
                  unitSlug: 'simple-sentences',
                  unitTitle: 'Simple sentences',
                  unitOrder: 2,
                },
              ],
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
          yearSlug: z.string({ description: 'Year group slug' }),
          yearTitle: z.string({ description: 'Year group title' }),
          units: z.array(
            z.object({
              unitSlug: z.string({ description: 'Unit slug' }),
              unitTitle: z.string({ description: 'Unit title' }),
              unitOrder: z.number({ description: 'Unit order' }),
            }),
          ),
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
            distinct_on: unitSlug
          ) {
            unitSlug
            unitTitle
            unitOrder
            yearSlug
            yearTitle
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

      type Unit = {
        unitSlug: string;
        unitTitle: string;
        unitOrder: number;
      };

      type UnitRecord = Unit & {
        yearSlug: string;
        yearTitle: string;
      };
      const units = res[lessonView] as UnitRecord[];

      const result = units.reduce(
        (acc, unit) => {
          if (!acc[unit.yearSlug]) {
            acc[unit.yearSlug] = {
              yearSlug: unit.yearSlug,
              yearTitle: unit.yearTitle,
              units: [],
            };
          }

          const { unitSlug, unitTitle, unitOrder } = unit;

          acc[unit.yearSlug].units.push({
            unitSlug,
            unitTitle,
            unitOrder,
          });

          return acc;
        },
        {} as Record<
          string,
          { yearSlug: string; yearTitle: string; units: Unit[] }
        >,
      );

      const keys = Object.keys(result);
      for (const key of keys) {
        const year = result[key];
        year.units.sort((a, b) => a.unitOrder - b.unitOrder);
      }

      return Object.values(result);
    }),
});
