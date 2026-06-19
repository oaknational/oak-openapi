import { protectedProcedure } from '@/lib/protect';
import { router } from '@/lib/trpc';
import * as z from 'zod/v4';
import { errorResponses } from '@/lib/errorResponses';
import { subjectSequenceRequestOpenAPISchema } from '@/lib/zod-openapi/generated/subjects';
import {
  programmeUnitsRequestOpenAPISchema,
  programmeUnitsResponseOpenAPISchema,
} from '@/lib/zod-openapi/generated/sequenceProgrammes';
import {
  getClient,
  programmesByYearView,
  SyntheticProgrammeByYear,
  SyntheticProgrammesByYearView,
  UnitVariantLessonsView,
  unitVariantLessonsView,
  gql,
} from '@/lib/owaClient';
import { parseSubjectPhaseSlug } from '@/lib/sequenceSlugParser';

const sequenceProgrammesResponseOpenAPISchema = z.array(z.string()).meta({
  id: 'SequenceProgrammesResponseSchema',
  example: [
    'english-secondary-year-7',
    'english-secondary-year-8',
    'english-secondary-year-9',
    'english-secondary-year-10-aqa',
    'english-secondary-year-10-edexcel',
    'english-secondary-year-10-eduqas',
    'english-secondary-year-11-aqa',
    'english-secondary-year-11-edexcel',
    'english-secondary-year-11-eduqas',
  ],
});

export const getAllProgrammesForSequence = router({
  getAllProgrammesForSequence: protectedProcedure
    .meta({
      openapi: {
        tags: ['programmes'],
        method: 'GET',
        path: '/sequences/{sequence}/programmes',
        summary: 'Get all programmes for a sequence',
        /* FIXME this is wrong, it references hallucinations */
        description: `Use when you need to discover the programmes within a sequence — to get a programme's slug for use with GET /sequences/{sequence}/programmes/{programme} or its sub-endpoints. Returns programmes grouped by key stage, each with year group, slug (e.g. y7, y10-biology-foundation), and applicable programme factors (exam board, tier, child subject).

Not for: the metadata of one programme (GET /sequences/{sequence}/programmes/{programme}); the units, questions, or assets of one programme (GET /sequences/{sequence}/programmes/{programme}/units, /questions, or /assets); the sequence-level summary (GET /sequences/{sequence}).`,
        errorResponses,
      },
    })
    .input(subjectSequenceRequestOpenAPISchema)
    .output(sequenceProgrammesResponseOpenAPISchema)
    .query(async ({ input }) => {
      const { sequence } = input;

      const parsedSequence = parseSubjectPhaseSlug(sequence);

      const client = getClient();
      const query = gql`
        query ($subjectMatch: jsonb!) {
          ${programmesByYearView}(
            where: {
              _or: [
                { programme_fields: { _contains: $subjectMatch } }
              ]
              is_legacy: { _eq: false }
            }
          ) {
            programme_slug
          }
        }`;

      const res: SyntheticProgrammesByYearView = await client.request(query, {
        subjectMatch: {
          subject_slug: parsedSequence.subjectSlug,
          phase_slug: parsedSequence.phaseSlug,
        },
      });

      const rows: SyntheticProgrammeByYear[] = res[programmesByYearView] ?? [];

      return rows
        .map((row) => row.programme_slug)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    }),

  getProgrammeUnits: protectedProcedure
    .meta({
      openapi: {
        tags: ['programmes', 'units'],
        method: 'GET',
        path: '/sequences/{sequence}/programmes/{programme}/units',
        summary: 'Units in a programme',
        description: `Use when you need the unit sequence for one programme — units as an ordered arrangement designed to build knowledge progressively. Get programme slugs from GET /sequences/{sequence}/programmes. Returns units in unit sequence order with title, slug, and any associated factors.

  Not for: every unit across the whole sequence (GET /sequences/{sequence}/units); a flat list of units for a key stage + subject without programme structure (GET /key-stages/{keyStage}/subject/{subject}/units); a single unit (GET /units/{unit}/summary); units in a thread (GET /threads/{threadSlug}/units).`,
        errorResponses,
      },
    })
    .input(programmeUnitsRequestOpenAPISchema)
    .output(programmeUnitsResponseOpenAPISchema)
    .query(async ({ input }) => {
      const { programme } = input;

      // Validate the sequence slug so callers get a clear BAD_REQUEST rather
      // than an empty result for a malformed path parameter.
      parseSubjectPhaseSlug(input.sequence);

      const client = getClient();
      const query = gql`
        query ($programme: String!) {
          ${unitVariantLessonsView}(
            where: {
              programme_slug: { _eq: $programme }
              is_legacy: { _eq: false }
            }
          ) {
            unit_slug
            unit_title: unit_data(path: "title")
            optionality: programme_fields(path: "optionality")
            supplementary_data
          }
        }
      `;

      const res: UnitVariantLessonsView = await client.request(query, {
        programme,
      });

      const rows = res[unitVariantLessonsView];

      // Deduplicate: the view has one row per lesson; we only need one row per
      // unit (the first encountered carries the order and title).
      const seen = new Map<
        string,
        { unitSlug: string; unitTitle: string; unitOrder: number }
      >();

      for (const row of rows) {
        if (seen.has(row.unit_slug)) continue;
        seen.set(row.unit_slug, {
          unitSlug: row.unit_slug,
          unitTitle: row.optionality ?? row.unit_title,
          unitOrder: row.supplementary_data.unit_order,
        });
      }

      return Array.from(seen.values()).sort(
        (a, b) => a.unitOrder - b.unitOrder,
      );
    }),
});
