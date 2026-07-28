import 'zod-openapi';
import * as z from 'zod/v4';
import { keyStageSlugs, subjectSlugs } from '@/lib/keyStageAndSubjects';
export const lessonSearchRequestOpenAPISchema = z.object({
  q: z.string().meta({
    description: 'Search query text snippet',
    example: 'gothic',
  }),
  keyStage: z
    .enum(keyStageSlugs as [string])
    .meta({
      description:
        "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
    })
    .optional()
    .meta({
      example: 'ks2',
    }),
  subject: z
    .enum(subjectSlugs as [string])
    .meta({
      description:
        "Subject slug to filter by, e.g. 'english' - note that casing is important here, and should be lowercase",
    })
    .optional()
    .meta({
      example: 'english',
    }),
  unit: z
    .string()
    .describe('Optional unit slug to additionally filter by')
    .optional()
    .meta({
      example: 'Gothic poetry',
    }),
});
