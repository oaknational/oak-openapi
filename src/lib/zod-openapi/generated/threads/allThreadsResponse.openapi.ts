import * as z from 'zod/v4';
import { threadSchema } from '@/lib/handlers/threads/types';

export const allThreadsResponseOpenAPISchema = z.array(threadSchema).meta({
  example: [
    {
      title: 'Number: Multiplication and division',
      slug: 'number-multiplication-and-division',
      unitCount: 78,
    },
  ],

  id: 'AllThreadsResponseSchema',
});
