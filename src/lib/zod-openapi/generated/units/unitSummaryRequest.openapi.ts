import 'zod-openapi';
import * as z from 'zod/v4';
import { childSubjects, examBoards, pathways } from '@/lib/oakConsts';
import { tierSlugs } from '@oaknational/oak-curriculum-schema';
export const unitSummaryRequestOpenAPISchema = z.object({
  unit: z.string().describe('The unit slug').meta({
    example: 'programming-subroutines',
  }),
  examBoard: z
    .enum(examBoards as [string, ...string[]])
    .optional()
    .describe(
      "Optional exam board slug to narrow the unit to a specific programme variant, e.g. 'aqa'.",
    )
    .meta({
      example: 'aqa',
    }),
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
  childSubject: z
    .enum(childSubjects)
    .optional()
    .describe(
      "Optional science child subject slug to narrow the unit to a specific programme variant. Only available for science units, e.g. 'biology'.",
    ),
});
