import * as z from 'zod/v4';
import { subjectSlugs } from '@/lib/keyStageAndSubjects';

export const subjectSequenceRequestOpenAPISchema = z.object({
  subject: z.enum(subjectSlugs).meta({
    description: 'The slug identifier for the subject',
    example: 'art',
  }),
});
