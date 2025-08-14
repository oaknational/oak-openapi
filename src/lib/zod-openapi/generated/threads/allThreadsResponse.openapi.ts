import 'zod-openapi/extend';
import { z } from 'zod';
import { threadSchema } from '@/lib/handlers/threads/types';

export const allThreadsResponseOpenAPISchema = z.array(threadSchema).openapi({
  ref: 'AllThreadsResponseSchema',
  example: [
    {
      title: 'Number: Multiplication and division',
      slug: 'number-multiplication-and-division',
    },
    {
      title: 'Number: Place value',
      slug: 'number-place-value',
    },
  ],
});
