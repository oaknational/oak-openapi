import * as z from 'zod/v4';
import { limitSchema, offsetSchema } from '@/lib/handlers/commonTypes';
import { questionFilterSchema } from '@/lib/handlers/questions/types';
import { subjectSlugs } from '@/lib/keyStageAndSubjects';

export const questionsForProgrammeRequestOpenAPISchema = z.object({
  subject: z
    .enum(subjectSlugs)
    .meta({ description: 'The subject slug identifier', example: 'computing' }),
  programme: z.string().meta({
    description: 'The programme slug identifier',
    example: 'computing-secondary-year-7',
  }),
  offset: offsetSchema,
  limit: limitSchema,
  filter: questionFilterSchema.optional(),
});
