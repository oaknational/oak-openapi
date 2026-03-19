import { protectedProcedure } from '@/lib/protect';
import { router } from '@/lib/trpc';
import { errorResponses } from '@/lib/errorResponses';
import type { UnitVariantLessonsView } from 'lib/owaClient';
import { getClient, gql, unitVariantLessonsView } from 'lib/owaClient';

import {
  keyStageSubjectLessonsRequestOpenAPISchema,
  keyStageSubjectLessonsResponseOpenAPISchema,
} from '@/lib/zod-openapi/generated/keyStageSubjectLessons';
import { nextPageLink } from '@/lib/pagination';

export const getKeyStageSubjectLessons = router({
  getKeyStageSubjectLessons: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['lists', 'lessons'],
        path: '/key-stages/{keyStage}/subject/{subject}/lessons',
        summary: 'Lessons',
        description:
          'This endpoint returns an array of available published lessons for a given subject and key stage, grouped by unit.',
        errorResponses,
      },
    })
    .input(keyStageSubjectLessonsRequestOpenAPISchema)
    .output(keyStageSubjectLessonsResponseOpenAPISchema)
    .query(async ({ input, ctx }) => {
      const keyStage = decodeURIComponent(input.keyStage);
      const subject = decodeURIComponent(input.subject);
      const unit = input.unit || null;

      const offset = input.offset ?? 0;
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

      const res = await client.request(query, variables);

      const lessons = (res as UnitVariantLessonsView)[unitVariantLessonsView];

      if (lessons.length === 0) {
        return [];
      }

      let next = null;
      if (lessons.length === limit) {
        next = nextPageLink(
          ctx.req.url,
          offset,
          limit,
          unit ? { unit } : undefined,
        );

        ctx.resHeaders.set('link', `<${next}>; rel="next"`);
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
