import toSorted from 'array.prototype.tosorted';
import { protectedProcedure } from '~/lib/protect';
import { router } from '~/lib/trpc';
import { z } from 'zod';
// import { blockedSubjects } from '../blockedContent';
// import { TRPCError } from '@trpc/server';
import {
  getClient,
  gql,
  SequenceView,
  sequenceView,
  sequenceViewWhereInput,
} from '../owaClient';
import { parseSubjectPhaseSlug } from '../sequenceSlugParser';
import { examBoards } from '../oakConsts';

toSorted.shim();

type UnitFromDb = {
  title: string;
  slug: string;
  order: number;
};

type Unit = {
  unitTitle: string;
  unitSlug: string;
  order: number;
};

const input = z.object({
  sequence: z.string(),
  year: z.number().optional(),
});

function pushUnit(unit: UnitFromDb): Unit {
  const { title, slug, order } = unit;

  return {
    unitTitle: title.trim(),
    unitSlug: slug.trim(),
    order,
  };
}

function fixOrder(units: Unit[]) {
  return units.map((unit, index) => ({ ...unit, order: index + 1 }));
}

export const getSequences = router({
  getSequenceUnits: protectedProcedure
    .meta({
      openapi: {
        tags: ['lists', 'units'],
        method: 'GET',
        path: '/sequences/{sequence}/units',
        description: '',
        example: {
          request: {
            sequence: 'science-secondary-edexcel',
          },
          response: [],
        },
      },
    })
    .input(input)
    .output(z.any())
    .query(async ({ input }) => {
      const client = getClient();

      const yearFilter = input.year || 0;

      const { phaseSlug, subjectSlug, ks4OptionSlug } = parseSubjectPhaseSlug(
        input.sequence,
      );

      const baseWhere = {
        _and: [
          {
            _or: [
              { subject_slug: { _eq: subjectSlug } },
              { subject_parent_slug: { _eq: subjectSlug } },
            ],
          },
          { phase_slug: { _eq: phaseSlug } },
          { state: { _eq: 'published' } },
        ],
      };

      const isExamboard = ks4OptionSlug
        ? examBoards.includes(ks4OptionSlug)
        : false;

      const examboardSlug = isExamboard ? ks4OptionSlug : null;
      const pathwaySlug = !isExamboard ? ks4OptionSlug : null;

      const examboardCondition = examboardSlug
        ? {
            _or: [
              { examboard_slug: { _eq: examboardSlug } },
              {
                _and: [
                  { examboard_slug: { _is_null: true } },
                  {
                    _or: [
                      { pathway_slug: { _neq: 'core' } },
                      { pathway_slug: { _is_null: true } },
                    ],
                  },
                ],
              },
            ],
          }
        : { examboard_slug: { _is_null: true } };

      const pathwayCondition = pathwaySlug
        ? {
            _or: [
              { pathway_slug: { _eq: pathwaySlug } },
              { pathway_slug: { _is_null: true } },
            ],
          }
        : { pathway_slug: { _is_null: true } };

      const where = {
        ...baseWhere,
        _and: [
          ...baseWhere._and,
          isExamboard ? examboardCondition : pathwayCondition,
        ],
      };

      const query = gql`
      query ($where: ${sequenceViewWhereInput}!) {
        ${sequenceView}(
          where: $where
          order_by: { order: asc }
        ) {
          title
          slug
          domain
          examboard_slug
          keystage_slug
          order
          pathway
          pathway_slug
          phase
          subject
          subjectcategories
          subject_parent
          subject_slug
          tier
          tier_slug
          unit_options
          year
        }
      }`;

      const res: SequenceView = await client.request(query, { where });

      const rawData = res[sequenceView];

      const years = Array.from(
        rawData.reduce<Set<number>>(
          (acc, curr) => acc.add(Number(curr.year)),
          new Set(),
        ),
      ).sort((a, b) => a - b);

      const subjectSlugToTitle = new Map<string, string>(
        rawData.map((_) => [_.subject_slug, _.subject]),
      );

      const result = [];

      for (const year of years) {
        // reduce down to only the units for this particular year
        const byYear = rawData.filter(
          (unit) => parseInt(unit.year, 10) === year,
        );

        // now check if there's any subject categories
        // if there are, we need to start grouping by subject, and then
        // check for tiers.

        // this isn't ideal, because the subjectcategories field is an array
        // that I'm assuming has a length of 1 (brittle) and then I'm attempting
        // to slugify the title.
        let useSlugMap = true;
        const subjects = new Set(
          byYear
            .filter((unit) => unit.subjectcategories.length > 0)
            .map((unit) => {
              if (unit.subject_parent) {
                return unit.subject_slug;
              }
              useSlugMap = false;
              return unit.subjectcategories[0].title;
            }),
        );

        if (subjects.size === 0) {
          // when there's no subjects for the year, we first check
          // to see if there's tiers (such as maths-secondary), and if so,
          // then we drop into the tiers and group by _that_.

          const tiers = new Set(
            byYear.map((_) => _.tier_slug).filter((_) => _ !== null),
          );

          if (tiers.size > 0) {
            const tierData = Array.from(tiers).map((tier) => {
              return {
                tier,
                units: fixOrder(
                  byYear.filter((_) => _.tier_slug === tier).map(pushUnit),
                ),
              };
            });

            result.push({
              year,
              tiers: tierData, // contains tier + units
            });
          } else {
            // otherwise it's a simple and direct line to the units.
            result.push({ year, units: byYear.map(pushUnit) });
          }
        } else {
          // otherwise we need to start collecting all the subjects
          const res = [];
          for (const subject of subjects) {
            const units = byYear.filter((unit) => {
              if (unit.subject_parent) {
                return unit.subject_slug === subject;
              }

              return (
                unit.subjectcategories.length > 0 &&
                unit.subjectcategories[0].title === subject
              );
            });

            const tiers = new Set(
              units.map((_) => _.tier_slug).filter((_) => _ !== null),
            );

            if (tiers.size > 0) {
              const tierData = Array.from(tiers).map((tier) => {
                return {
                  tier,
                  units: fixOrder(
                    units.filter((_) => _.tier_slug === tier).map(pushUnit),
                  ),
                };
              });

              res.push({
                subjectTitle: useSlugMap
                  ? subjectSlugToTitle.get(subject)
                  : subject,
                subjectSlug: useSlugMap ? subject : subject.toLowerCase(),
                tiers: tierData, // contains tier + units
              });
            } else {
              res.push({
                subjectTitle: useSlugMap
                  ? subjectSlugToTitle.get(subject)
                  : subject,
                subjectSlug: useSlugMap ? subject : subject.toLowerCase(),

                units: fixOrder(units.map(pushUnit)),
              });
            }
          }
          result.push({ year, subjects: res });
        }
      }

      if (yearFilter) {
        return result.filter((_) => _.year === yearFilter);
      }

      return result;
    }),
});
