import 'zod-openapi/extend';
import { z } from 'zod';
import { threadSchema } from '@/lib/handlers/threads/types';

export const allThreadsResponseOpenAPISchema = z
  .array(threadSchema)
  .openapi({
    example: [
      {
        title: 'A Midsummer Night\u2019s Dream',
        slug: 'a-midsummer-nights-dream-72',
      },
    ],
  });
