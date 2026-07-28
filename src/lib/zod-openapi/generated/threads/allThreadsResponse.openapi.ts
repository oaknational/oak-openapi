import 'zod-openapi';
import * as z from 'zod/v4';
import { threadSchema } from '@/lib/handlers/threads/types';
export const allThreadsResponseOpenAPISchema = z.array(threadSchema).meta({
  id: 'AllThreadsResponseSchema',
  example: [
    {
      title: 'Number: Multiplication and division',
      slug: 'number-multiplication-and-division',
      unitCount: 78,
    },
    {
      title: 'Number: Place value',
      slug: 'number-place-value',
      unitCount: 56,
    },
  ],
});
