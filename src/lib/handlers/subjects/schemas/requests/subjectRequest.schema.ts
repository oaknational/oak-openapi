import * as z from 'zod/v4';
import { subjectSlugSchema } from '@/lib/handlers/commonTypes';

export const subjectRequestSchema = z.object({
  subject: subjectSlugSchema,
});
