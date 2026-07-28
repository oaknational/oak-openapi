import 'zod-openapi';
import * as z from 'zod/v4';
export const rateLimitResponseOpenAPISchema = z
  .object({
    limit: z
      .number()
      .describe(
        'The maximum number of requests you can make in the current window.',
      )
      .meta({
        example: 1000,
      }),
    remaining: z
      .number()
      .describe('The number of requests remaining in the current window.')
      .meta({
        example: 953,
      }),
    reset: z
      .number()
      .describe(
        'The time at which the current window resets, in milliseconds since the Unix epoch.',
      )
      .meta({
        example: 1740164400000,
      }),
  })
  .meta({
    id: 'RateLimitResponseSchema',
    example: {
      limit: 1000,
      remaining: 953,
      reset: 1740164400000,
    },
  });
