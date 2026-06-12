import * as z from 'zod/v4';
import { subjectSlugs } from '@/lib/keyStageAndSubjects';

export const subjectKeyStagesRequestSchema = z.object({
  subject: z.enum(subjectSlugs).describe('The subject slug identifier'),
});
