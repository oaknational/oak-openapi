import * as z from 'zod/v4';
import { subjects } from '@/lib/oakConsts';

export const programmeUnitsRequestOpenAPISchema = z.object({
  subject: z
    .enum(subjects as [string, ...string[]])
    .meta({ description: 'The subject slug identifier', example: 'english' }),
  programme: z.string().meta({
    description: 'The programme slug identifier',
    example: 'english-secondary-year-10-edexcel',
  }),
});
