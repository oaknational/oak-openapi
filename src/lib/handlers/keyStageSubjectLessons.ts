import { protectedProcedure } from '~/lib/protect';
import { router } from '~/lib/trpc';
import { keyStageSlugs, subjectSlugs } from 'lib/keyStageAndSubjects';
import {
  UnitVariantLessonsView,
  getClient,
  gql,
  unitVariantLessonsView,
} from 'lib/owaClient';
import { z } from 'zod';
import { baseUrl } from '../baseUrl';

export const getKeyStageSubjectLessons = router({
  getKeyStageSubjectLessons: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['lists', 'lessons'],
        path: '/key-stages/{keyStage}/subject/{subject}/lessons',
        description:
          'This endpoint returns all the lessons (titles and slugs) that are currently available on Oak for a given subject and key stage, grouped by unit',
        example: {
          response: [
            {
              unitSlug: 'simple-compound-and-adverbial-complex-sentences',
              unitTitle: 'Simple, compound and adverbial complex sentences',
              lessons: [
                {
                  lessonSlug: 'four-types-of-simple-sentence',
                  lessonTitle: 'Four types of simple sentence',
                },
                {
                  lessonSlug:
                    'three-ways-for-co-ordination-in-compound-sentences',
                  lessonTitle:
                    'Three ways for co-ordination in compound sentences',
                },
              ],
            },
          ],
          request: {
            keyStage: 'ks1',
            subject: 'english',
            unit: 'word-class',
          },
        },
      },
    })
    .input(
      z.object({
        keyStage: z.enum(keyStageSlugs as [string], {
          description:
            "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
        }),
        subject: z.enum(subjectSlugs as [string], {
          description:
            "Subject slug to filter by, e.g. 'english' - note that casing is important here, and should be lowercase",
        }),
        unit: z
          .string({
            description: 'Optional unit slug to additionally filter by',
          })
          .optional(),
        offset: z.number().optional().default(0),
        limit: z
          .number({
            description: 'Limit the number of results returned, max 100',
          })
          .lte(100)
          .optional()
          .default(10),
      }),
    )
    .output(
      z.array(
        z.object({
          unitSlug: z.string({ description: 'Unit slug' }),
          unitTitle: z.string({ description: 'Unit title' }),
          lessons: z.array(
            z.object({
              lessonSlug: z.string({ description: 'Lesson slug' }),
              lessonTitle: z.string({ description: 'Lesson title' }),
            }),
          ),
        }),
      ),
    )
    .query(async ({ input, ctx }) => {
      const keyStage = decodeURIComponent(input.keyStage);
      const subject = decodeURIComponent(input.subject);
      const unit = input.unit || null;

      const offset = input.offset;
      const limit = input.limit;

      const client = getClient();

      const unitFilter = unit ? `unit_slug: {_eq: "${unit}"}` : '';

      const query = gql`
        query ($filter: jsonb!, $offset: Int! $limit: Int!) {
          ${unitVariantLessonsView}(
            where: {
              programme_fields: {
                _contains: $filter
              }
              is_legacy: { _eq: false }
              ${unitFilter}
            },
            offset: $offset,
            limit: $limit,
            order_by: {unit_slug: asc}
          ) {
            lesson_slug: lesson_data(path: "slug")
            lesson_title: lesson_data(path: "title")
            unit_slug
            unit_title:unit_data(path:"title")
          }
        }
      `;

      const variables = {
        filter: {
          subject_slug: subject,
          keystage_slug: keyStage,
        },
        offset,
        limit,
      };

      const res = (await client.request(
        query,
        variables,
      )) as UnitVariantLessonsView;

      const lessons = res[unitVariantLessonsView];

      if (lessons.length === 0) {
        return [];
      }

      let next = null;
      if (lessons.length === limit) {
        next = `${baseUrl}${ctx.req.url}?offset=${
          offset + limit
        }&limit=${limit}`;
        if (unit) {
          next += `&unit=${unit}`;
        }
        ctx.res.setHeader('link', `<${next}>; rel="next"`);
      }

      // transform to be an array of the units with a list of lessons
      const units = lessons.reduce(
        (
          acc,
          {
            unit_slug: unitSlug,
            unit_title: unitTitle,
            lesson_slug: lessonSlug,
            lesson_title: lessonTitle,
          },
        ) => {
          const unit = acc.find((u) => u.unitSlug === unitSlug);

          // this is never true, but keeps TypeScript quiet
          if (!lessonSlug || !lessonTitle || !unitSlug || !unitTitle) {
            return acc;
          }

          const res = {
            lessonSlug,
            lessonTitle,
          };

          if (unit) {
            unit.lessons.push(res);
          } else {
            acc.push({
              unitSlug,
              unitTitle,
              lessons: [res],
            });
          }

          return acc;
        },
        [] as {
          unitSlug: string;
          unitTitle: string;
          lessons: { lessonSlug: string; lessonTitle: string }[];
        }[],
      );

      return units;
    }),
});
