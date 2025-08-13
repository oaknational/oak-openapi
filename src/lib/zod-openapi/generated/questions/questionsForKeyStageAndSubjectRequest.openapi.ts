import 'zod-openapi/extend';
import { keyStageSlugs, subjectSlugs } from '@/lib/keyStageAndSubjects';
import z from 'zod';

export const questionsForKeyStageAndSubjectRequestOpenAPISchema = z.object({
  keyStage: z
    .enum(keyStageSlugs as [string])
    .openapi({
      description:
        "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
      example: 'ks1',
    }),
  subject: z
    .enum(subjectSlugs as [string])
    .openapi({
      description:
        "Subject slug to search by, e.g. 'science' - note that casing is important here",
      example: 'art',
    }),
  offset: z
    .number({
      description:
        'If limiting results returned, this allows you to return the next set of results, starting at the given offset point',
    })
    .optional()
    .default(0),
  limit: z
    .number({
      description: 'Limit the number of results returned, max 100',
    })
    .lte(100)
    .optional()
    .default(10),
});
