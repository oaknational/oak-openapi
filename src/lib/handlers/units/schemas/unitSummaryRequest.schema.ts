import * as z from 'zod/v4';
import { examBoards, pathways } from '@/lib/oakConsts';
import { tierSlugs } from '@oaknational/oak-curriculum-schema';

export const unitSummaryRequestSchema = z.object({
  unit: z.string().describe('The unit slug'),
  examBoard: z
    .enum(examBoards as [string, ...string[]])
    .optional()
    .describe(
      "Optional exam board slug to narrow the unit to a specific programme variant, e.g. 'aqa'.",
    ),
  pathway: z
    .enum(pathways as [string, ...string[]])
    .optional()
    .describe(
      "Optional pathway slug to narrow the unit to a specific programme variant, e.g. 'gcse'.",
    ),
  tier: tierSlugs
    .optional()
    .describe(
      "Optional tier slug to narrow the unit to a specific programme variant, e.g. 'foundation'.",
    ),
});
