import 'zod-openapi';
import * as z from 'zod/v4';
import { keyStageSlugs, subjectSlugs } from '@/lib/keyStageAndSubjects';
import { phases } from '@/lib/oakConsts';
const validPhases = phases.filter((p) => p !== 'foundation') as [string];
export const keywordsRequestOpenAPISchema = z
  .object({
    subject: z
      .enum(subjectSlugs as [string])
      .optional()
      .describe(
        "Subject slug to search by, e.g. 'science' - note that casing is important here (always lowercase)",
      ),
    keyStage: z
      .enum(keyStageSlugs as [string])
      .optional()
      .describe("Key stage slug to filter by, e.g. 'ks2'"),
    phase: z
      .enum(validPhases)
      .optional()
      .describe(
        "Phase to filter by, e.g. 'primary' or 'secondary'. Cannot be combined with keyStage.",
      ),
    unit: z
      .string()
      .optional()
      .describe(
        "Unit slug to search by, e.g. 'forces-and-magnets' - note that casing is important here (always lowercase)",
      ),
    lesson: z
      .string()
      .optional()
      .describe(
        "Lesson slug to search by, e.g. 'animating-text' - note that casing is important here (always lowercase)",
      ),
  })
  .refine((data) => data.subject !== undefined || data.unit !== undefined, {
    message:
      'At least one of subject or unit must be provided - note that they are all the slug form of the values (e.g. "ks2" for key stage 2, "science" for the science subject, and "forces-and-magnets" for the forces and magnets unit), and that casing is important (always lowercase).',
  })
  .refine((data) => !(data.phase && data.keyStage), {
    message:
      'phase and keyStage cannot both be provided. Use phase (e.g. "primary") to filter by multiple key stages, or keyStage (e.g. "ks2") for a specific key stage.',
  });
