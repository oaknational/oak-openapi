import { subjectSlugs } from '@/lib/keyStageAndSubjects';
import * as z from 'zod/v4';

export const subjectRequestOpenAPISchema = z.object({
  subject: z.enum(subjectSlugs).meta({
    description: 'The slug identifier for the subject',
    example: 'art',
  }),
});
