import 'zod-openapi/extend';
import z from 'zod';
import { downloadTypeEnum } from '@/lib/handlers/assets/types';

export const sequenceAssetsRequestOpenAPISchema = z
  .object({
    sequence: z
      .string()
      .openapi({
        example: 'maths-secondary',
        description: 'The unique identifier for each sequence',
      }),
    year: z.number().optional(),
    type: downloadTypeEnum.optional(),
  })
  .openapi({
    example: { sequence: 'maths-secondary' },
  });
