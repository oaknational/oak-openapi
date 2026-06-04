import * as z from 'zod/v4';
import { subjectSlugs } from '@/lib/keyStageAndSubjects';

export const subjectYearsRequestSchema = z.object({
  subject: z.enum(subjectSlugs).meta({
    example: 'cooking-nutrition',
    description: 'Subject slug to filter by',
  }),
});
