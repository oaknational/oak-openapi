import { examBoards } from '@/lib/oakConsts';
import {
  keyStageSlugSchema,
  subjectSlugSchema,
  offsetSchema,
  limitSchema,
} from '@/lib/handlers/commonTypes';
import * as z from 'zod/v4';

export const allKeyStageAndSubjectUnitsRequestSchema = z.object({
  keyStage: keyStageSlugSchema,
  subject: subjectSlugSchema,
  examBoard: z
    .enum(examBoards as [string])
    .optional()
    .describe(
      "Optional exam board slug to filter units by, e.g. 'aqa'. Only meaningful at KS4 where subjects are broken down by exam board.",
    ),
  offset: offsetSchema,
  limit: limitSchema,
});
