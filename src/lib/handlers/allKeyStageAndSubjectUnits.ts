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
              unitOptionParentSlug: z
                .string({
                  description: 'Parent slug for optional unit variants',
                })
                .optional(),
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
            unitVariantId
            nullUnitVariantId
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
        unitOptionParentSlug?: string;
      };

      type UnitRecord = Unit & {
        yearSlug: string;
        yearTitle: string;
        nullUnitVariantId: number;
        unitVariantId: number;
      };
      const units = res[lessonView] as UnitRecord[];

      const optionalUnitParents: Set<string> = new Set();

      const result = units.reduce(
        (acc, unit) => {
          if (!acc[unit.yearSlug]) {
            acc[unit.yearSlug] = {
              yearSlug: unit.yearSlug,
              yearTitle: unit.yearTitle,
              units: [],
            };
          }

          const {
            unitSlug,
            unitTitle,
            unitOrder,
            unitVariantId,
            nullUnitVariantId,
          } = unit;

          const res: Unit = {
            unitSlug,
            unitTitle,
            unitOrder,
          };

          if (unitVariantId !== nullUnitVariantId) {
            // then we have an optional variant, so we need to add the parent slug
            res.unitOptionParentSlug = units.find(
              (u) => u.unitVariantId === nullUnitVariantId,
            )?.unitSlug;

            if (res.unitOptionParentSlug) {
              optionalUnitParents.add(res.unitOptionParentSlug);
            }
          }

          acc[unit.yearSlug].units.push(res);

          return acc;
        },
        {} as Record<
          string,
          { yearSlug: string; yearTitle: string; units: Unit[] }
        >,
      );

      // sort first by the year slug, then by the unit order
      const sorted = [];
      const keys = Object.keys(result).sort();
      for (const key of keys) {
        const year = result[key];
        year.units = year.units
          .sort((a, b) => a.unitOrder - b.unitOrder)
          .filter((u) => {
            if (optionalUnitParents.has(u.unitSlug)) {
              return false;
            }

            return true;
          });
        sorted.push(year);
      }

      return sorted;
    }),
});
