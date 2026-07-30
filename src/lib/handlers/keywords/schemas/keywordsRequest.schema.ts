import * as z from 'zod/v4';
import { keyStageSlugs, subjectSlugs } from '@/lib/keyStageAndSubjects';
import { limitSchema, offsetSchema } from '@/lib/handlers/commonTypes';
import { phases } from '@/lib/oakConsts';
import { requestRulesKey } from '@/lib/zod-openapi/schema/requestMetadata';

const validPhases = phases.filter((p) => p !== 'foundation') as [string];

// Rules spanning more than one parameter. They're both refined (so a bad
// request 400s) and listed under `requestRulesKey` (so they reach the generated
// OpenAPI document, which can only describe each parameter in isolation).
const atLeastOneFilterRule =
  'At least one of subject, keyStage, phase, unit or lesson must be provided - note that they are all the slug form of the values (e.g. "ks2" for key stage 2, "science" for the science subject, and "forces-and-magnets" for the forces and magnets unit), and that casing is important (always lowercase).';

// const phaseOrKeyStageRule =
//   'phase and keyStage cannot both be provided. Use phase (e.g. "primary") to filter by multiple key stages, or keyStage (e.g. "ks2") for a specific key stage.';

export const keywordsRequestSchema = z
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
    offset: offsetSchema,
    limit: limitSchema.describe(
      'Limit the number of keywords, e.g. return a maximum of 300 keywords',
    ),
  })
  .refine(
    ({ subject, keyStage, phase, unit, lesson }) =>
      [subject, keyStage, phase, unit, lesson].some(
        (filter) => filter !== undefined,
      ),
    { message: atLeastOneFilterRule },
  )
  // .refine((data) => !(data.phase && data.keyStage), {
  //   message: phaseOrKeyStageRule,
  // })
  .meta({ [requestRulesKey]: [atLeastOneFilterRule] });
