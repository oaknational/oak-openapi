import * as z from 'zod/v4';
import { keyStageSlugs, subjectSlugs } from '@/lib/keyStageAndSubjects';

export const offsetSchema = z
  .number()
  .describe(
    'If limiting results returned, this allows you to return the next set of results, starting at the given offset point',
  )
  .meta({ example: 50 })
  .optional()
  .default(0);

export const limitSchema = z
  .number()
  .describe('Limit the number of lessons, e.g. return a maximum of 100 lessons')
  .meta({ example: 10 })
  .lte(100)
  .optional()
  .default(10);

export const keyStageSubjectSchema = z.object({
  keyStage: z
    .enum(keyStageSlugs as [string])
    .describe("Key stage slug to filter by, e.g. 'ks2'"),
  subject: z
    .enum(subjectSlugs as [string])
    .describe(
      "Subject slug to search by, e.g. 'science' - note that casing is important here (always lowercase)",
    ),
});
