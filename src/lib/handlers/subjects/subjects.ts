import { protectedProcedure } from '@/lib/protect';
import { router } from '@/lib/trpc';
import * as z from 'zod/v4';
import type { SubjectPhaseView } from '@/lib/owaClient';
import {
  currentCycle,
  getClient,
  gql,
  subjectPhaseView,
} from '@/lib/owaClient';
import { TRPCError } from '@trpc/server';
import {
  getSubjectPhase,
  phaseToKeyStages,
  phaseToSequences,
  yearsFromKeyStages,
} from './helpers';
import { errorResponses } from '@/lib/errorResponses';
import {
  allSubjectsResponseOpenAPISchema,
  subjectKeyStagesRequestOpenAPISchema,
  subjectKeyStagesResponseOpenAPISchema,
  subjectRequestOpenAPISchema,
  subjectResponseOpenAPISchema,
  subjectSequenceRequestOpenAPISchema,
  subjectSequenceResponseOpenAPISchema,
  subjectYearsRequestOpenAPISchema,
  subjectYearsResponseOpenAPISchema,
} from '@/lib/zod-openapi/generated/subjects';

export const getSubjects = router({
  getAllSubjects: protectedProcedure
    .meta({
      openapi: {
        tags: ['lists'],
        method: 'GET',
        path: '/subjects',
        summary: 'All subjects',
        description: `Use this when you need a catalogue of every subject Oak currently offers, each with its sequences, key stages, and years in one call.

Returns every subject ordered by Oak's display order, with 'subjectTitle', 'subjectSlug', 'sequenceSlugs', 'keyStages', and 'years'. This is the entry point for building a subject picker or crawling the whole curriculum.

Do not use this for:
- A single subject (use GET /subjects/{subject})
- Just the sequence slugs, key stages, or years in isolation (use GET /subjects/{subject}/sequences, GET /subjects/{subject}/key-stages, or GET /subjects/{subject}/years)
- Lessons or units inside a subject (use GET /key-stages/{keyStage}/subject/{subject}/lessons or GET /key-stages/{keyStage}/subject/{subject}/units)`,
        errorResponses,
      },
    })
    .input(z.void())
    .output(allSubjectsResponseOpenAPISchema)
    .query(async () => {
      const client = getClient();
      // filtering out financial education
      const query = gql`
      query ($currentCycle: String!) @cached(ttl: 300) {
        ${subjectPhaseView}(
          where: {
            cycle: { _eq: $currentCycle }
            _not: {slug: {_eq: "financial-education"}}
          }
          order_by: { display_order: asc }
        ) {
          title
          slug
          keystages
          phases
          ks4_options
          display_order
        }
      }`;

      const res: SubjectPhaseView = await client.request(query, {
        currentCycle,
      });

      if (
        !res ||
        !Array.isArray(res[subjectPhaseView]) ||
        res[subjectPhaseView].length === 0
      ) {
        throw new TRPCError({
          message: `There was a problem requesting the subjects and associated data`,
          code: 'INTERNAL_SERVER_ERROR',
        });
      }

      const reply = res[subjectPhaseView].map((subject) => {
        const keyStages = phaseToKeyStages(subject);
        return {
          subjectTitle: subject.title,
          subjectSlug: subject.slug,
          sequenceSlugs: phaseToSequences(subject),
          keyStages,
          years: yearsFromKeyStages(keyStages),
        };
      });

      return reply;
    }),
  getSubject: protectedProcedure
    .meta({
      openapi: {
        tags: ['lists'],
        method: 'GET',
        summary: 'Single subject with sequences, key stages, and years',
        path: '/subjects/{subject}',
        errorResponses,
        description: `Use this when you have a subject slug and want the same bundle that GET /subjects returns, but for one subject only.

Returns 'subjectTitle', 'subjectSlug', 'sequenceSlugs', 'keyStages', and 'years' for the subject. Prefer this over GET /subjects when you already know which subject you are working with.

Do not use this for:
- Every subject in one call (use GET /subjects)
- Just one of the fields in isolation (use GET /subjects/{subject}/sequences, GET /subjects/{subject}/key-stages, or GET /subjects/{subject}/years)
- Subject-scoped lessons or units (use GET /key-stages/{keyStage}/subject/{subject}/lessons or GET /key-stages/{keyStage}/subject/{subject}/units)

Example slug: 'subject=maths'`,
      },
    })
    .input(subjectRequestOpenAPISchema)
    .output(subjectResponseOpenAPISchema)
    .query(async ({ input }) => {
      const subject = await getSubjectPhase(input.subject);

      const keyStages = phaseToKeyStages(subject);
      return {
        subjectTitle: subject.title,
        subjectSlug: subject.slug,
        sequenceSlugs: phaseToSequences(subject),
        keyStages,
        years: yearsFromKeyStages(keyStages),
      };
    }),
  getSubjectSequence: protectedProcedure
    .meta({
      openapi: {
        tags: ['lists', 'sequences'],
        method: 'GET',
        summary: 'Sequence slugs for a subject',
        path: '/subjects/{subject}/sequences',
        errorResponses,
        description: `Use this when you only need the sequence slugs for a subject — for example, to drive a sequence picker or pass the slug into GET /sequences/{sequence}/units.

Returns sequence slugs for the subject. For secondary subjects this includes KS4 variants such as exam board sequences (AQA, Edexcel, OCR) and non-GCSE 'core' unit sequences.

Do not use this for:
- The full subject bundle (use GET /subjects/{subject})
- Units inside a sequence (use GET /sequences/{sequence}/units)

Example slug: 'subject=science'`,
      },
    })
    .input(subjectSequenceRequestOpenAPISchema)
    .output(subjectSequenceResponseOpenAPISchema)
    .query(async ({ input }) => {
      return phaseToSequences(await getSubjectPhase(input.subject));
    }),
  getSubjectKeyStages: protectedProcedure
    .meta({
      openapi: {
        tags: ['lists'],
        method: 'GET',
        summary: 'Key stages for a subject',
        path: '/subjects/{subject}/key-stages',
        errorResponses,
        description: `Use this when you only need the key stages in which a subject is currently taught.

Returns key stages (titles and slugs) available for the subject. Smaller payload than GET /subjects/{subject}.

Do not use this for:
- Every key stage across Oak (use GET /key-stages)
- The full subject bundle including sequences and years (use GET /subjects/{subject})

Example slug: 'subject=history'`,
      },
    })
    .input(subjectKeyStagesRequestOpenAPISchema)
    .output(subjectKeyStagesResponseOpenAPISchema)
    .query(async ({ input }) => {
      return phaseToKeyStages(await getSubjectPhase(input.subject));
    }),
  getSubjectYears: protectedProcedure
    .meta({
      openapi: {
        tags: ['lists'],
        method: 'GET',
        summary: 'Year groups for a subject',
        path: '/subjects/{subject}/years',
        errorResponses,
        description: `Use this when you only need the year groups in which a subject is currently taught.

Returns an array of year numbers derived from the key stages available for the subject.

Do not use this for:
- The full subject bundle (use GET /subjects/{subject})
- Key stages rather than years (use GET /subjects/{subject}/key-stages)

Example slug: 'subject=english'`,
      },
    })
    // TODO: put these examples in their own file
    .input(subjectYearsRequestOpenAPISchema)
    .output(subjectYearsResponseOpenAPISchema)
    .query(async ({ input }) => {
      return yearsFromKeyStages(
        phaseToKeyStages(await getSubjectPhase(input.subject)),
      );
    }),
});
