import * as z from 'zod/v4';
import { limitSchema, offsetSchema } from '@/lib/handlers/commonTypes';
import { questionFilterSchema } from '@/lib/handlers/questions/types';
import { subjects } from '@/lib/oakConsts';

export const questionsForProgrammeRequestOpenAPISchema = z.object({
  subject: z
    .enum(subjects as [string, ...string[]])
    .meta({ description: 'The subject slug identifier', example: 'computing' }),
  programme: z.string().meta({
    description: 'The programme slug identifier',
    example: 'computing-secondary-year-7',
  }),
  offset: offsetSchema,
  limit: limitSchema,
  filter: questionFilterSchema.optional(),
});
