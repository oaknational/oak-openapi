import * as z from 'zod/v4';
import { examBoards, pathways } from '@/lib/oakConsts';
import { tierSlugs } from '@oaknational/oak-curriculum-schema';

export const unitSummaryRequestOpenAPISchema = z.object({
  unit: z.string().meta({
    description: 'The unit slug',
    example: 'programming-subroutines',
  }),
  examBoard: z
    .enum(examBoards as [string, ...string[]])
    .optional()
    .meta({
      description:
        "Optional exam board slug to filter the unit summary by, e.g. 'aqa'.",
      example: 'aqa',
    }),
  pathway: z
    .enum(pathways as [string, ...string[]])
    .optional()
    .meta({
      description:
        "Optional pathway slug to filter the unit summary by, e.g. 'gcse'.",
      example: 'gcse',
    }),
  tier: tierSlugs.optional().meta({
    description:
      "Optional tier slug to filter the unit summary by, e.g. 'foundation'.",
    example: 'foundation',
  }),
});
