import * as z from 'zod/v4';

export const programmeUnitsResponseOpenAPISchema = z
  .array(
    z.object({
      unitSlug: z.string().meta({
        description: 'The unit slug identifier',
        example: 'variables-and-data-types',
      }),
      unitTitle: z.string().meta({
        description: 'The unit title',
        example: 'Variables and data types',
      }),
      unitOrder: z.number().meta({
        description: 'The unit order within the programme',
        example: 1,
      }),
    }),
  )
  .meta({
    id: 'ProgrammeUnitsResponseSchema',
    example: [
      {
        unitSlug: 'variables-and-data-types',
        unitTitle: 'Variables and data types',
        unitOrder: 1,
      },
      {
        unitSlug: 'algorithms',
        unitTitle: 'Algorithms',
        unitOrder: 2,
      },
    ],
  });
