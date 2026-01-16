import toSorted from 'array.prototype.tosorted';
import { protectedProcedure } from '@/lib/protect';
import { router } from '@/lib/trpc';
import {
  getClient,
  gql,
  Sequence,
  SequenceView,
  sequenceView,
  sequenceViewWhereInput,
} from '../../owaClient';
import { parseSubjectPhaseSlug } from '../../sequenceSlugParser';
import { examBoards } from '../../oakConsts';
import { blockedSequenceSubjects } from '../../blockedContent';
import { TRPCError } from '@trpc/server';
import {
  Category,
  ExamSubjectsWithoutTiers,
  ExamSubjectsWithTiers,
  SequenceSchema,
  YearSequence,
  Tier,
} from '@/lib/handlers/sequences/types';

import {
  sequenceUnitsRequestOpenAPISchema,
  sequenceUnitsResponseOpenAPISchema,
} from '@/lib/zod-openapi/generated/sequences';

toSorted.shim();

type WhereCondition = {
  _and: Array<{
    _or?: Array<{
      subject_slug?: { _eq: string };
      subject_parent_slug?: { _eq: string };
    }>;
    phase_slug?: { _eq: string };
    state?: { _eq: string };
    year?: { _eq: string };
    non_curriculum?: { _eq: boolean };
  }>;
};

export function sequenceWhere(
  sequence: string,
  year?: string,
  ignorePathway = false,
) {
  const { phaseSlug, subjectSlug, ks4OptionSlug } =
    parseSubjectPhaseSlug(sequence);

  const baseWhere: WhereCondition = {
    _and: [
      {
        _or: [
          { subject_slug: { _eq: subjectSlug } },
          { subject_parent_slug: { _eq: subjectSlug } },
        ],
      },
      { phase_slug: { _eq: phaseSlug } },
      { state: { _eq: 'published' } },
      { non_curriculum: { _eq: false } },
    ],
  };

  if (year) {
    baseWhere._and.push({ year: { _eq: year } });
  }

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

  const res = {
    ...baseWhere,
    _and: [...baseWhere._and],
  };

  if (isExamboard) {
    res._and.push(examboardCondition as WhereCondition['_and'][0]);
  } else if (!ignorePathway) {
    res._and.push(pathwayCondition as WhereCondition['_and'][0]);
  }

  return res;
}

export const getSequences = router({
  getSequenceUnits: protectedProcedure
    .meta({
      openapi: {
        tags: ['units', 'sequences', 'unit-and-curriculum-data'],
        method: 'GET',
        summary: 'Units within a sequence',
        path: '/sequences/{sequence}/units',
        description:
          'This endpoint returns high-level information for all of the units in a sequence. Units are returned in the intended sequence order and are grouped by year.',
        errorResponses: [],
      },
    })
    .input(sequenceUnitsRequestOpenAPISchema)
    .output(sequenceUnitsResponseOpenAPISchema)
    .query(async ({ input }) => {
      const client = getClient();

      let yearFilter = 0;

      if (input.year === 'all-years') {
        yearFilter = 0;
      } else if (input.year && typeof input.year === 'string') {
        yearFilter = parseInt(input.year, 10);
      }

      const { subjectSlug } = parseSubjectPhaseSlug(input.sequence);

      if (blockedSequenceSubjects.includes(subjectSlug)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `The subject "${subjectSlug}" is not currently available`,
        });
      }

      const where = sequenceWhere(input.sequence);

      const query = gql`
      query ($where: ${sequenceViewWhereInput}!) {
        ${sequenceView}(
          where: $where
          order_by: { order: asc }
        ) {
          title
          threads
          slug
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
          features
          actions
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
      )
        .sort((a, b) => a - b)
        .filter((year) => {
          if (yearFilter) {
            return year === yearFilter;
          }
          return true;
        });

      const result: SequenceSchema[] = [];

      const ks4Years = years.filter((year) => year >= 10);

      // this is (currently) _only_ used in PE (for swimming)
      const exclusionYearUnits: YearSequence = {
        year: 'all-years',
        title: undefined,
        units: [],
      };

      const applyExclusion =
        yearFilter === 0 && subjectSlug === 'physical-education';

      years.forEach((year) => {
        const yearUnits = rawData
          .filter((_) => Number(_.year) === year)
          .filter((_) => {
            if (_.actions?.group_units_as) {
              exclusionYearUnits.title = _.actions.group_units_as;
            }

            if (!applyExclusion) {
              // early return - we don't need to split the units
              return true;
            }

            if (!_.features?.pe_swimming) {
              return true;
            }

            exclusionYearUnits.units.push(formatUnit(_));

            // then remove the swimming unit from the normal year list
            return false;
          });

        let hasExamSubjectOverride = false;

        /**
         * if years is 0 (i.e. all) _AND_ the subject is PE then
         * 1. we need to _ignore_ any swimming units from the "normal" results
         * 2. we need to separate out the swimming units into their own "magic" year
         */

        // then we're going to check for examSubjects / child subjects
        const seen = new Set<string>();

        // let's find out how many subjects there are,
        // if there's only one, then we don't break it into examSubjects
        for (const { subject, subject_parent, actions } of yearUnits) {
          if (subject_parent && !seen.has(subject)) {
            seen.add(subject);
          }

          // checking for programme_override_exclusions for subjects
          if (actions?.programme_field_overrides?.subject) {
            seen.add(actions.programme_field_overrides.subject);
            hasExamSubjectOverride = true;
          }
        }

        // let's use the first unit in the year sequence

        const hasTiers = !!yearUnits[0].tier_slug;
        const hasExamSubjects = seen.size > 1 || hasExamSubjectOverride;

        if (!ks4Years.includes(year) || (!hasExamSubjects && !hasTiers)) {
          const units = formatUnits(yearUnits);

          result.push({
            year,
            units,
          });
          return; // early return
        }

        if (!hasExamSubjects && hasTiers) {
          const tiers = formatUnitsForTiers(yearUnits);

          result.push({
            year,
            tiers,
          });
          return;
        }

        const examSubjects: (
          | ExamSubjectsWithTiers
          | ExamSubjectsWithoutTiers
        )[] = [];

        // reset seen
        seen.clear();

        for (const { subject, subject_slug, actions } of yearUnits) {
          const programmeFieldSubject =
            actions?.programme_field_overrides?.subject;
          const examSubjectTitle = programmeFieldSubject || subject;

          if (!seen.has(examSubjectTitle)) {
            seen.add(examSubjectTitle);

            if (hasTiers) {
              examSubjects.push({
                examSubjectTitle,
                examSubjectSlug: subject_slug,
                tiers: formatUnitsForTiers(yearUnits, subject).sort((a, b) =>
                  a.tierSlug < b.tierSlug ? -1 : 1,
                ),
              });
            } else {
              examSubjects.push({
                examSubjectTitle,
                examSubjectSlug: subject_slug,
                units: formatUnits(yearUnits, (_) => _.subject === subject),
              });
            }
          }
        }

        result.push({
          year,
          examSubjects,
        });
      });

      if (applyExclusion && exclusionYearUnits.units.length > 0) {
        result.unshift(exclusionYearUnits);
      }

      return result;
    }),
});

export function formatUnit(unit: Sequence) {
  let categories: Category[] | undefined;

  const threads =
    unit.threads?.length > 0
      ? Array.from(unit.threads).map(({ title, slug, order }) => ({
          threadTitle: title,
          threadSlug: slug,
          order,
        }))
      : undefined;

  if (unit.subjectcategories && unit.subjectcategories.length > 0) {
    categories = unit.subjectcategories.map((cat) => ({
      categoryTitle: cat.title,
      categorySlug: cat.slug,
    }));
  }

  if (unit.unit_options && unit.unit_options.length > 0) {
    return {
      unitTitle: unit.title,
      unitOrder: unit.order,
      unitOptions: unit.unit_options.map((option) => ({
        unitSlug: option.slug,
        unitTitle: option.title,
      })),
      threads,
      categories,
    };
  } else {
    return {
      unitSlug: unit.slug,
      unitTitle: unit.title,
      unitOrder: unit.order,
      threads,
      categories,
    };
  }
}

type UnitFilter = (unit: Sequence) => boolean;

function formatUnits(units: Sequence[], filter: UnitFilter = () => true) {
  return units.filter(filter).map(formatUnit);
}

function formatUnitsForTiers(
  units: Sequence[],
  subject?: string | undefined,
): Tier[] {
  const tiers = units.reduce<Tier[]>((acc, curr) => {
    const { tier_slug: tierSlug, tier: tierTitle } = curr;

    const existing = acc.find((_) => _.tierSlug === tierSlug);

    if (!existing) {
      acc.push({
        tierSlug,
        tierTitle,
        units: formatUnits(
          units,
          (_: Sequence) =>
            _.tier_slug === tierSlug &&
            (subject ? _.subject === subject : true),
        ),
      });
    }

    return acc;
  }, []);

  return tiers;
}
