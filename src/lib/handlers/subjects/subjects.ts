import { protectedProcedure } from '@/lib/protect';
import { router } from '@/lib/trpc';
import * as z from 'zod/v4';
import { subjectSlugs } from '@/lib/keyStageAndSubjects';
import {
  getSubjectFromProgrammes,
  getSubjectPhase,
  phaseToKeyStages,
  yearsFromKeyStages,
} from './helpers';
import { errorResponses } from '@/lib/errorResponses';
import {
  allSubjectsResponseOpenAPISchema,
  subjectKeyStagesRequestOpenAPISchema,
  subjectKeyStagesResponseOpenAPISchema,
  subjectRequestOpenAPISchema,
  subjectResponseOpenAPISchema,
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
        description: `Use this when you need a catalogue of every subject Oak currently offers.

This is the entry point for building a subject picker or crawling the whole curriculum.

Do not use this for:
- A single subject (use GET /subjects/{subject})
- Just the sequence slugs, key stages, or years in isolation (use GET /subjects/{subject}/sequences, GET /subjects/{subject}/key-stages, or GET /subjects/{subject}/years)
- Lessons or units inside a subject (use GET /key-stages/{keyStage}/subject/{subject}/lessons or GET /key-stages/{keyStage}/subject/{subject}/units)`,
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
    .query(({ input }) => {
      return getSubjectFromProgrammes(input.subject);
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
