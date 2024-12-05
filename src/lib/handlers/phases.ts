import { protectedProcedure } from '~/lib/protect';
import { router } from '~/lib/trpc';
import { z } from 'zod';
import { subjectsByKeyStage, subjectSlugs } from '~/lib/keyStageAndSubjects';
import { getClient, gql, lessonView, LessonView } from '~/lib/owaClient';

const phaseSlugs = ['primary', 'secondary'] as const;

const phases = [
  {
    phaseSlug: 'primary',
    phaseTitle: 'Primary',
    keyStages: [
      {
        keyStageSlug: 'ks1',
        keyStageTitle: 'Key Stage 1',
        subjects: subjectsByKeyStage('ks1'),
      },
      {
        keyStageSlug: 'ks2',
        keyStageTitle: 'Key Stage 2',
        subjects: subjectsByKeyStage('ks2'),
      },
    ],
  },
  {
    phaseSlug: 'secondary',
    phaseTitle: 'Secondary',
    keyStages: [
      {
        keyStageSlug: 'ks3',
        keyStageTitle: 'Key Stage 3',
        subjects: subjectsByKeyStage('ks3'),
      },
      {
        keyStageSlug: 'ks4',
        keyStageTitle: 'Key Stage 4',
        subjects: subjectsByKeyStage('ks4'),
      },
    ],
  },
];

export const getPhases = router({
  getAllPhases: protectedProcedure
    .meta({
      openapi: {
        tags: ['lists'],
        method: 'GET',
        path: '/phases',
      },
    })
    .input(z.void())
    .output(z.any())
    .query(() => phases),
  getPhaseSubjects: protectedProcedure
    .meta({
      openapi: {
        tags: ['lists'],
        method: 'GET',
        path: '/phases/{phaseSlug}/subjects',
      },
    })
    .input(
      z.object({
        phaseSlug: z.enum(phaseSlugs),
      }),
    )
    .output(z.any())
    .query(({ input }) =>
      phases.find((phase) => phase.phaseSlug === input.phaseSlug),
    ),
  getPhaseUnits: protectedProcedure
    .meta({
      openapi: {
        tags: ['lists'],
        method: 'GET',
        // fixme - may require the exam slug
        path: '/phases/{phaseSlug}/subject/{subject}/units',
      },
    })
    .input(
      z.object({
        phaseSlug: z.enum(phaseSlugs),
        subject: z.enum(subjectSlugs as [string], {
          description:
            "Subject slug to filter by, e.g. 'english' - note that casing is important here, and should be lowercase",
        }),
      }),
    )
    .output(z.any())
    .query(async ({ input }) => {
      const { phaseSlug, subject } = input;

      const client = getClient();

      const query = gql`
        query getPhaseUnits($slug: String!) {
          ${lessonView}(
            distinct_on: unitSlug,
            where: {
              programmeSlug: {
                _like: $slug
              }
            }
          ) {
            unitSlug
            unitTitle
            programmeSlug
            examBoardSlug
            yearSlug
            yearTitle
            unitOrder
            unitVariantId
            nullUnitVariantId
          }
        }
      `;

      const res: LessonView = await client.request(query, {
        slug: `${subject}-${phaseSlug}-%`,
      });

      // if (res[unitCurriculumView].length === 0) {
      //   throw new TRPCError({ code: 'NOT_FOUND', message: 'Unit not found' });
      // }

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

      // FIXME we will need the optional unit logic here too.
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

      // sort by year which appear as "year-3", "year-10"
      // though year-10 never appears with any years lower due to the fact
      // ks4 has year 10 + 11
      const keys = Object.keys(result).sort((a, b) => {
        const aYear = parseInt(a.split('-')[1], 10);
        const bYear = parseInt(b.split('-')[1], 10);
        return aYear - bYear;
      });
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
