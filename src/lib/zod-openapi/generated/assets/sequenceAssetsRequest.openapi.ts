import 'zod-openapi/extend';
import z from 'zod';
import { downloadTypeEnum } from '@/lib/handlers/assets/types';

export const sequenceAssetsRequestOpenAPISchema = z
  .object({
    sequence: z.string().openapi({
      example: 'maths-secondary',
      description: 'The unique identifier for each sequence',
    }),

    year: z
      .number({
        description:
          'The year group to filter by. For the physical-education-primary sequence, a value of all-years can also be used.',
      })
      .openapi({
        example: 3,
      })
      .optional(),
    type: downloadTypeEnum
      .openapi({
        example: 'video',
      })
      .optional(),
  })
  .openapi({
    example: { sequence: 'maths-secondary' },
  });
