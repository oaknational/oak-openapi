import 'zod-openapi/extend';
import { sequenceSchema } from '@/lib/types';
import { z } from 'zod';

export const sequenceUnitsResponseOpenAPISchema = z
  .array(sequenceSchema)
  .openapi({
    example: [
      {
        year: 1,
        units: [
          {
            unitTitle: 'Speaking and Listening',
            unitOrder: 1,
            unitSlug: 'speaking-and-listening',
            categories: [{ categoryTitle: 'Reading, writing & oracy' }],
            threads: [
              {
                threadTitle: 'Developing spoken language',
                threadSlug: 'developing-spoken-language',
                order: 8,
              },
            ],
          },
        ],
      },
    ],
  });
