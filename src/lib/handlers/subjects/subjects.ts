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
  getSubjectFromProgrammes,
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
        summary: 'Subjects',
        description:
          'This endpoint returns an array of all available subjects and their associated sequences, key stages and years.',
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
        summary: 'Subject',
        path: '/subjects/{subject}',
        errorResponses,
        description:
          'This endpoint returns the sequences, key stages and years that are currently available for a given subject.',
      },
    })
    .input(subjectRequestOpenAPISchema)
    .output(subjectResponseOpenAPISchema)
    .query(async ({ input }) => {
      return getSubjectFromProgrammes(input.subject);
    }),
  getSubjectSequence: protectedProcedure
    .meta({
      openapi: {
        tags: ['lists', 'sequences'],
        method: 'GET',
        summary: 'Sequencing information for a given subject',
        path: '/subjects/{subject}/sequences',
        errorResponses,
        description:
          'This endpoint returns an array of sequence objects that are currently available for a given subject. For secondary sequences, this includes information about key stage 4 variance such as exam board sequences and non-GCSE ‘core’ unit sequences.',
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
        summary: 'Key stages within a subject',
        path: '/subjects/{subject}/key-stages',
        errorResponses,
        description:
          'This endpoint returns a list of key stages that are currently available for a given subject.',
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
        summary: 'Year groups for a given subject',
        path: '/subjects/{subject}/years',
        errorResponses,
        description:
          'This endpoint returns an array of years that are currently available for a given subject.',
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
