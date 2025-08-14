import 'zod-openapi/extend';
import z from 'zod';

export const rateLimitResponseOpenAPISchema = z
  .object({
    limit: z
      .number()
      .openapi({
        description:
          'The maximum number of requests you can make in the current window.',
        example: 1000,
      }),
    remaining: z
      .number()
      .openapi({
        description: 'The number of requests remaining in the current window.',
        example: 953,
      }),
    reset: z
      .number()
      .openapi({
        description:
          'The time at which the current window resets, in milliseconds since the Unix epoch.',
        example: 1740164400000,
      }),
  })
  .openapi({
    ref: 'RateLimitResponseSchema',
    example: { limit: 1000, remaining: 953, reset: 1740164400000 },
  });
