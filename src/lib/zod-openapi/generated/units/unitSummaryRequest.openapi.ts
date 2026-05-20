import * as z from 'zod/v4';
import { childSubjects, examBoards, pathways } from '@/lib/oakConsts';
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
        "Optional exam board slug to narrow the unit to a specific programme variant, e.g. 'aqa'.",
      example: 'aqa',
    }),
  pathway: z
    .enum(pathways as [string, ...string[]])
    .optional()
    .meta({
      description:
        "Optional pathway slug to narrow the unit to a specific programme variant, e.g. 'gcse'.",
      example: 'gcse',
    }),
  tier: tierSlugs.optional().meta({
    description:
      "Optional tier slug to narrow the unit to a specific programme variant, e.g. 'foundation'.",
    example: 'foundation',
  }),
  childSubject: z.enum(childSubjects).optional().meta({
    description:
      "Optional science child subject slug to narrow the unit to a specific programme variant. Only available for science units, e.g. 'biology'.",
    example: undefined,
  }),
});
