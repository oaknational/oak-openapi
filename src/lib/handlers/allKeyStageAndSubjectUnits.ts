import { protectedProcedure } from '@/lib/protect';
import { router } from '@/lib/trpc';
import { gql } from 'graphql-request';
import { keyStageSlugs, subjectSlugs } from 'lib/keyStageAndSubjects';
import {
  UnitVariantLessonsView,
  getClient,
  unitVariantLessonsView,
} from 'lib/owaClient';
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
        // example: {
        //   response: [
        //     {
        //       units: [
        //         {
        //           unitSlug:
        //             '2-4-and-8-times-tables-using-times-tables-to-solve-problems',
        //           unitTitle:
        //             '2, 4 and 8 times tables: using times tables to solve problems',
        //         },
        //         {
        //           unitSlug:
        //             'bridging-100-counting-on-and-back-in-10s-adding-subtracting-multiples-of-10',
        //           unitTitle:
        //             'Bridging 100: counting on and back in 10s, adding/subtracting multiples of 10',
        //         },
        //       ],
        //       yearSlug: 'year-3',
        //       yearTitle: 'Year 3',
        //     },
        //   ],
        // },
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
        query ($blob: jsonb!) {
          ${unitVariantLessonsView}(
            where: {
              programme_fields:{
                _contains:$blob
              }
              is_legacy: { _eq: false }
            }
            distinct_on: unit_slug
          ) {
            unit_slug
            unit_title:unit_data(path:"title")
            year_slug: programme_fields(path: "year_slug")
            optionality: programme_fields(path: "optionality")
          }
        }
      `;

      const variables = {
        blob: {
          subject_slug: subject,
          keystage_slug: keyStage,
        },
      };

      const graphqlClient = getClient();
      const res: UnitVariantLessonsView = await graphqlClient.request(
        query,
        variables,
      );

      if (res[unitVariantLessonsView].length === 0) {
        return []; // unlikely, but sure.
      }

      const units = res[unitVariantLessonsView];

      const result = units.reduce(
        (acc, unit) => {
          const yearSlug = unit.year_slug;
          const yearTitle = `Year ${unit.year_slug.split('-')[1]}`;
          if (!acc[yearSlug]) {
            acc[yearSlug] = {
              yearSlug,
              yearTitle,
              units: [],
            };
          }

          const { unit_slug: unitSlug } = unit;

          const unitTitle = unit.optionality || unit.unit_title;

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
