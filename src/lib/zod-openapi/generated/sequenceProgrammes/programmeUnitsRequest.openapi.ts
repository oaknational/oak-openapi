import * as z from 'zod/v4';
import { subjectSlugs } from '@/lib/keyStageAndSubjects';

export const programmeUnitsRequestOpenAPISchema = z.object({
  subject: z
    .enum(subjectSlugs)
    .meta({ description: 'The subject slug identifier', example: 'english' }),
  programme: z.string().meta({
    description: 'The programme slug identifier',
    example: 'english-secondary-year-10-edexcel',
  }),
});
