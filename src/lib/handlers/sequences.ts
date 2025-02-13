import toSorted from 'array.prototype.tosorted';
import { protectedProcedure } from '~/lib/protect';
import { router } from '~/lib/trpc';
import { z } from 'zod';
import {
  getClient,
  gql,
  Sequence,
  SequenceView,
  sequenceView,
  sequenceViewWhereInput,
} from '../owaClient';
import { parseSubjectPhaseSlug } from '../sequenceSlugParser';
import { examBoards } from '../oakConsts';
import { blockedSequenceSubjects } from '../blockedContent';
import { TRPCError } from '@trpc/server';

toSorted.shim();

const years = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  'all-years',
];

const input = z.object({
  sequence: z.string(),

  year: z.enum(years as [string]).optional(),
});

const categorySchema = z.object({
  categoryTitle: z.string(),
  categorySlug: z.string().optional(),
});

const threadSchema = z.object({
  threadTitle: z.string(),
  threadSlug: z.string(),
  order: z.number(),
});

const unitOptionSchema = z.object({
  unitTitle: z.string(),
  unitSlug: z.string(),
});

const unitWithOptionsSchema = z.object({
  unitTitle: z.string(),
  unitOrder: z.number(),
  unitOptions: z.array(unitOptionSchema),
  categories: z.array(categorySchema).optional(),
  threads: z.array(threadSchema).optional(),
});

const unitNoOptionsSchema = z.object({
  unitTitle: z.string(),
  unitOrder: z.number(),
  unitSlug: z.string(),
  categories: z.array(categorySchema).optional(),
  threads: z.array(threadSchema).optional(),
});

const unitSchema = z.union([unitWithOptionsSchema, unitNoOptionsSchema]);

const tierSchema = z.object({
  tier: z.string(),
  units: z.array(unitSchema),
});

const examSubjectsSchemaWithTiers = z.object({
  examSubjectTitle: z.string(),
  examSubjectSlug: z.string().optional(),
  tiers: z.array(tierSchema),
});

const examSubjectsSchemaWithoutTiers = z.object({
  examSubjectTitle: z.string(),
  examSubjectSlug: z.string().optional(),
  units: z.array(unitSchema),
});

const yearSequenceKS4WithExamSubjectsSchema = z.object({
  year: z.number(),
  title: z
    .string({
      description: 'Optional alternative title for the year sequence',
    })
    .optional(),
  examSubjects: z.array(
    z.union([examSubjectsSchemaWithTiers, examSubjectsSchemaWithoutTiers]),
  ),
});

const yearSequenceKS4WithoutExamSubjectsSchema = z.object({
  year: z.number(),
  title: z
    .string({
      description: 'Optional alternative title for the year sequence',
    })
    .optional(),
  tiers: z.array(tierSchema),
});

const yearSequenceSchema = z.object({
  year: z.union([z.number(), z.literal('all-years')]),
  title: z
    .string({
      description: 'Optional alternative title for the year sequence',
    })
    .optional(),
  units: z.array(unitSchema),
});

const sequenceSchema = z.union([
  yearSequenceSchema,
  yearSequenceKS4WithExamSubjectsSchema,
  yearSequenceKS4WithoutExamSubjectsSchema,
]);

const output = z.array(sequenceSchema);

export type SequenceSchema = z.infer<typeof sequenceSchema>;
export type YearSequence = z.infer<typeof yearSequenceSchema>;
export type ExamSubjectsWithTiers = z.infer<typeof examSubjectsSchemaWithTiers>;
export type ExamSubjectsWithoutTiers = z.infer<
  typeof examSubjectsSchemaWithoutTiers
>;
type Tier = z.infer<typeof tierSchema>;
type Category = z.infer<typeof categorySchema>;
export type yearSequenceKS4WithExamSubjects = z.infer<
  typeof yearSequenceKS4WithExamSubjectsSchema
>;
export type UnitWithOptions = z.infer<typeof unitWithOptionsSchema>;
export type UnitWithoutOptions = z.infer<typeof unitNoOptionsSchema>;
export type Unit = z.infer<typeof unitSchema>;

type WhereCondition = {
  _and: Array<{
    _or?: Array<{
      subject_slug?: { _eq: string };
      subject_parent_slug?: { _eq: string };
    }>;
    phase_slug?: { _eq: string };
    state?: { _eq: string };
    year?: { _eq: string };
  }>;
};

export function sequenceWhere(sequence: string, year?: string) {
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

  return {
    ...baseWhere,
    _and: [
      ...baseWhere._and,
      isExamboard ? examboardCondition : pathwayCondition,
    ],
  };
}

export const getSequences = router({
  getSequenceUnits: protectedProcedure
    .meta({
      openapi: {
        tags: ['lists', 'units', 'sequences'],
        method: 'GET',
        path: '/sequences/{sequence}/units',
        description: '',
        example: {
          request: {
            sequence: 'science-secondary-edexcel',
          },
          response: [
            {
              year: 3,
              subjects: [
                {
                  subjectSlug: 'grammar',
                  subjectTitle: 'Grammar',
                  units: [
                    {
                      unitTitle:
                        'Simple, compound and adverbial complex sentences',
                      unitSlug:
                        'simple-compound-and-adverbial-complex-sentences',
                      order: 1,
                    },
                    {
                      unitTitle: 'Tense forms: simple, progressive and perfect',
                      unitSlug: 'tense-forms-simple-progressive-and-perfect',
                      order: 2,
                    },
                    {
                      unitTitle: 'Speech first punctuation and apostrophes',
                      unitSlug: 'speech-first-punctuation-and-apostrophes',
                      order: 3,
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    })
    .input(input)
    .output(output)
    .query(async ({ input }) => {
      const client = getClient();

      let yearFilter = 0;

      if (input.year === 'all-years') {
        yearFilter = 0;
      } else if (input.year) {
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
                  a.tier < b.tier ? -1 : 1,
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

function formatUnit(unit: Sequence) {
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
    const { tier_slug: tier } = curr;

    const existing = acc.find((_) => _.tier === tier);

    if (!existing) {
      acc.push({
        tier,
        units: formatUnits(
          units,
          (_: Sequence) =>
            _.tier_slug === tier && (subject ? _.subject === subject : true),
        ),
      });
    }

    return acc;
  }, []);

  return tiers;
}
