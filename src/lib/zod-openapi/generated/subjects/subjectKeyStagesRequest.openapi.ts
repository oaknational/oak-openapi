import * as z from 'zod/v4';
import { subjectSlugs } from '@/lib/keyStageAndSubjects';

export const subjectKeyStagesRequestOpenAPISchema = z.object({
  subject: z
    .enum(subjectSlugs)
    .meta({ description: 'The subject slug identifier', example: 'art' }),
});
