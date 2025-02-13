import { protectedProcedure } from '~/lib/protect';
import { router } from '~/lib/trpc';
import { gql } from 'graphql-request';
import { keyStageSlugs, subjectSlugs } from 'lib/keyStageAndSubjects';
import { SequenceView, getClient, sequenceView } from 'lib/owaClient';
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
            }),
          ),
        }),
      ),
    )
    .query(async ({ input }) => {
      const keyStage = decodeURIComponent(input.keyStage);
      const subject = decodeURIComponent(input.subject);

      const query = gql`
        query ($keyStage: String!, $subject: String!) {
          ${sequenceView}(
            where: {
              keystage_slug:{_eq:$keyStage},
              subject_slug:{_eq:$subject}
            }
          ) {
            slug
            title
            year
            unit_options
          }
        }
      `;

      const variables = {
        subject,
        keyStage,
      };

      const graphqlClient = getClient();
      const res: SequenceView = await graphqlClient.request(query, variables);

      if (res[sequenceView].length === 0) {
        return []; // unlikely, but sure.
      }

      const units = res[sequenceView];

      const result = units.reduce(
        (acc, unit) => {
          const yearSlug = `year-${unit.year}`;
          const yearTitle = `Year ${unit.year}`;
          if (!acc[yearSlug]) {
            acc[yearSlug] = {
              yearSlug,
              yearTitle,
              units: [],
            };
          }

          const { slug: unitSlug } = unit;

          const unitTitle = unit.title;

          acc[yearSlug].units.push({
            unitSlug,
            unitTitle,
          });

          return acc;
        },
        {} as Record<
          string,
          {
            yearSlug: string;
            yearTitle: string;
            units: { unitSlug: string; unitTitle: string }[];
          }
        >,
      );

      // sort first by the year slug, then by the unit order
      const sorted = [];

      // sort by year which appear as "year-3", "year-10"
      // though year-10 never appears with any years lower due to the fact
      // ks4 has year 10 + 11
      const keys = Object.keys(result).sort((a, b) => {
        const aYear = parseInt(a.split('-')[1], 10);
        const bYear = parseInt(b.split('-')[1], 10);
        return aYear - bYear;
      });
      for (const key of keys) {
        sorted.push(result[key]);
      }

      return sorted;
    }),
});
