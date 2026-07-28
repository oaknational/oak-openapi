import 'zod-openapi';
import * as z from 'zod/v4';
import { subjectSlugs } from '@/lib/keyStageAndSubjects';
export const subjectRequestOpenAPISchema = z.object({
  subject: z
    .enum(subjectSlugs)
    .describe('The slug identifier for the subject')
    .meta({
      example: 'art',
    }),
});
