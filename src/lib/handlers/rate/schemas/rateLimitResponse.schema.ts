import * as z from 'zod/v4';

export const rateLimitResponseSchema = z.object({
  limit: z.number({
    description:
      'The maximum number of requests you can make in the current window.',
  }),
  remaining: z.number({
    description: 'The number of requests remaining in the current window.',
  }),
  reset: z.number({
    description:
      'The time at which the current window resets, in milliseconds since the Unix epoch.',
  }),
});
