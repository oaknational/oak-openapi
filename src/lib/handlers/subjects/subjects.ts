import { protectedProcedure } from '@/lib/protect';
import { router } from '@/lib/trpc';
import * as z from 'zod/v4';
import {
  getSubjectFromProgrammes,
  getSubjectPhase,
  phaseToKeyStages,
  yearsFromKeyStages,
} from './helpers';
import { subjectSlugs } from '@/lib/keyStageAndSubjects';
import { errorResponses } from '@/lib/errorResponses';
import {
  allSubjectsResponseOpenAPISchema,
  subjectKeyStagesRequestOpenAPISchema,
  subjectKeyStagesResponseOpenAPISchema,
  subjectRequestOpenAPISchema,
  subjectResponseOpenAPISchema,
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
    .query(() => {
      return subjectSlugs.filter((slug) => slug !== 'financial-education');
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
    .input(subjectRequestOpenAPISchema)
    .output(z.array(subjectSequenceResponseOpenAPISchema))
    .query(async ({ input }) => {
      const subject = await getSubjectFromProgrammes(input.subject);

      return subject.sequenceSlugs.map((sequence) => ({
        ...sequence,
        ks4ProgrammeFactors: subject.ks4ProgrammeFactors,
      }));
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
    .input(subjectYearsRequestOpenAPISchema)
    .output(subjectYearsResponseOpenAPISchema)
    .query(async ({ input }) => {
      return yearsFromKeyStages(
        phaseToKeyStages(await getSubjectPhase(input.subject)),
      );
    }),
});
