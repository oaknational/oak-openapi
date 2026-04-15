import { protectedProcedure } from '@/lib/protect';
import { router } from '@/lib/trpc';
import {
  allKeyStageAndSubjectUnitsRequestOpenAPISchema,
  allKeyStageAndSubjectUnitsResponseOpenAPISchema,
} from '@/lib/zod-openapi/generated/allKeyStageAndSubjectUnits';
import { gql } from 'graphql-request';
import { errorResponses } from '@/lib/errorResponses';
import type { UnitVariantLessonsView } from 'lib/owaClient';

import { getClient, unitVariantLessonsView } from 'lib/owaClient';

export const getAllKeyStageAndSubjectUnits = router({
  getAllKeyStageAndSubjectUnits: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['lists', 'units'],
        summary: 'Units',
        path: '/key-stages/{keyStage}/subject/{subject}/units',
        errorResponses,
        description:
          'This endpoint returns an array of units containing available published lessons for a given key stage and subject, grouped by year. Units without published lessons will not be returned by this endpoint.',
      },
    })
    .input(allKeyStageAndSubjectUnitsRequestOpenAPISchema)
    .output(allKeyStageAndSubjectUnitsResponseOpenAPISchema)
    .query(async ({ input }) => {
      const keyStage = decodeURIComponent(input.keyStage);
      const subject = decodeURIComponent(input.subject);
      const examBoard = input.examBoard;

      // We drop `distinct_on: unit_slug` so that we can see every exam board a
      // unit appears in — otherwise KS4 units would get collapsed to a single
      // row and we'd lose the exam board information we want to expose on the
      // output.
      const query = gql`
        query ($filter: jsonb!) {
          ${unitVariantLessonsView}(
            where: {
              programme_fields:{
                _contains:$filter
              }
              is_legacy: { _eq: false }
            }
          ) {
            unit_slug
            unit_title:unit_data(path:"title")
            year_slug: programme_fields(path: "year_slug")
            optionality: programme_fields(path: "optionality")
            examboard_slug: programme_fields(path: "examboard_slug")
            examboard_title: programme_fields(path: "examboard")
          }
        }
      `;

      const variables: {
        filter: {
          keystage_slug: string;
          subject_slug?: string;
          subject_parent?: string;
          examboard_slug?: string;
        };
      } = {
        filter: {
          subject_slug: subject,
          keystage_slug: keyStage,
        },
      };

      if (keyStage === 'ks4' && subject === 'science') {
        delete variables.filter.subject_slug;
        variables.filter.subject_parent = 'Science';
      }

      if (examBoard) {
        variables.filter.examboard_slug = examBoard;
      }

      const graphqlClient = getClient();
      const res: UnitVariantLessonsView = await graphqlClient.request(
        query,
        variables,
      );

      if (res[unitVariantLessonsView].length === 0) {
        return []; // unlikely, but sure.
      }

      const rows = res[unitVariantLessonsView];

      interface GroupedUnit {
        unitSlug: string;
        unitTitle: string;
        examBoards?: { title: string; slug: string }[];
      }

      // Group rows by (yearSlug, unitSlug). When no exam board filter was
      // supplied, collect the distinct exam boards each unit appears in so we
      // can expose them on the output. When a filter was supplied we skip the
      // array — it would be a redundant single-entry list.
      const exposeExamBoards = !examBoard;
      const result: Record<
        string,
        {
          yearSlug: string;
          yearTitle: string;
          units: GroupedUnit[];
          _unitIndex: Map<string, GroupedUnit>;
        }
      > = {};

      for (const row of rows) {
        const yearSlug = row.year_slug;
        const yearTitle = `Year ${row.year_slug.split('-')[1]}`;
        if (!result[yearSlug]) {
          result[yearSlug] = {
            yearSlug,
            yearTitle,
            units: [],
            _unitIndex: new Map(),
          };
        }

        const bucket = result[yearSlug];
        const unitTitle = row.optionality || row.unit_title;
        const existing = bucket._unitIndex.get(row.unit_slug);
        const boardSlug = row.examboard_slug ?? null;
        const boardTitle = row.examboard_title ?? '';

        if (existing) {
          if (exposeExamBoards && boardSlug) {
            const boards = existing.examBoards ?? [];
            if (!boards.some((b) => b.slug === boardSlug)) {
              boards.push({ title: boardTitle, slug: boardSlug });
            }
            existing.examBoards = boards;
          }
          continue;
        }

        const unit: GroupedUnit = {
          unitSlug: row.unit_slug,
          unitTitle,
        };
        if (exposeExamBoards && boardSlug) {
          unit.examBoards = [{ title: boardTitle, slug: boardSlug }];
        }
        bucket.units.push(unit);
        bucket._unitIndex.set(row.unit_slug, unit);
      }

      // sort first by the year slug, then by the unit order
      // sort by year which appear as "year-3", "year-10"
      // though year-10 never appears with any years lower due to the fact
      // ks4 has year 10 + 11
      const keys = Object.keys(result).sort((a, b) => {
        const aYear = parseInt(a.split('-')[1], 10);
        const bYear = parseInt(b.split('-')[1], 10);
        return aYear - bYear;
      });

      return keys.map((key) => {
        const { yearSlug, yearTitle, units } = result[key];
        return { yearSlug, yearTitle, units };
      });
    }),
});
