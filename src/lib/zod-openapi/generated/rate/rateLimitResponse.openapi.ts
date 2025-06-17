import 'zod-openapi/extend';
import z from 'zod';

export const rateLimitResponseOpenAPISchema = z
  .object({
    limit: z
      .number({
        description:
          'The maximum number of requests you can make in the current window.',
      })
      .openapi({ example: 1000 }),
    remaining: z
      .number({
        description: 'The number of requests remaining in the current window.',
      })
      .openapi({ example: 953 }),
    reset: z
      .number({
        description:
          'The time at which the current window resets, in milliseconds since the Unix epoch.',
      })
      .openapi({ example: 1740164400000 }),
  })
  .openapi({ example: { limit: 1000, remaining: 953, reset: 1740164400000 } });
