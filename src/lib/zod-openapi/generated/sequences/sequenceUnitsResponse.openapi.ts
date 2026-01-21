import { sequenceSchema } from '@/lib/handlers/sequences/types';
import * as z from 'zod/v4';

export const sequenceUnitsResponseOpenAPISchema = z.array(sequenceSchema).meta({
  id: 'SequenceUnitsResponseSchema',
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
