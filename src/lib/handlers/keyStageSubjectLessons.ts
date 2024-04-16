import { protectedProcedure } from '~/lib/auth';
import { router } from '~/lib/trpc';
import { keyStageSlugs, subjectSlugs } from 'lib/keyStageAndSubjects';
import { LessonView, getClient, gql, lessonView } from 'lib/owaClient';
import { z } from 'zod';

export const getKeyStageSubjectLessons = router({
  getKeyStageSubjectLessons: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['lists', 'lessons'],
        path: '/key-stages/{keyStage}/subject/{subject}/lessons',
        description:
          'Get all the lessons for a given key stage and subject grouped by unit.',
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
        offset: z.number().optional().default(0),
        limit: z
          .number({
            description: 'Limit the number of results returned, max 100',
          })
          .lte(100)
          .optional()
          .default(10),
      })
    )
    .output(
      z.array(
        z.object({
          slug: z.string({ description: 'Unit slug' }),
          title: z.string({ description: 'Unit title' }),
          lessons: z.array(
            z.object({
              slug: z.string({ description: 'Lesson slug' }),
              title: z.string({ description: 'Lesson title' }),
            })
          ),
        })
      )
    )
    .query(async ({ input }) => {
      const keyStage = decodeURIComponent(input.keyStage);
      const subject = decodeURIComponent(input.subject);

      const offset = input.offset;
      const limit = input.limit;

      const client = getClient();

      const query = gql`
        query ($keyStage: String!, $subject: String!, $offset: Int!
          $limit: Int!) {
          ${lessonView}(
            where: {
              keyStageSlug: { _eq: $keyStage }
              subjectSlug: { _eq: $subject }
              isLegacy: { _eq: false }
            },
            offset: $offset,
            limit: $limit,
            order_by: {unitSlug: asc}
          ) {
            lessonSlug
            lessonTitle
            unitSlug,
            unitTitle
          }
        }
      `;

      const variables = {
        keyStage,
        subject,
        offset,
        limit,
      };

      const res = (await client.request(query, variables)) as LessonView;
      const lessons = res[lessonView];

      if (lessons.length === 0) {
        return [];
      }

      // transform to be an array of the units with a list of lessons
      const units = lessons.reduce(
        (acc, lesson) => {
          const unitSlug = lesson.unitSlug;
          const unitTitle = lesson.unitTitle;
          const unit = acc.find((u) => u.slug === unitSlug);

          // this is never true, but keeps TypeScript quiet
          if (
            !lesson.lessonSlug ||
            !lesson.lessonTitle ||
            !unitSlug ||
            !unitTitle
          ) {
            return acc;
          }

          const res = {
            slug: lesson.lessonSlug,
            title: lesson.lessonTitle,
          };

          if (unit) {
            unit.lessons.push(res);
          } else {
            acc.push({
              slug: unitSlug,
              title: unitTitle,
              lessons: [res],
            });
          }

          return acc;
        },
        [] as {
          slug: string;
          title: string;
          lessons: { slug: string; title: string }[];
        }[]
      );

      return units;
    }),
});
