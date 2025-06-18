import 'zod-openapi/extend';
import z from 'zod';

export const searchTranscriptRequestOpenAPISchema = z
  .object({
    q: z.string({
      description:
        'A snippet of text to search for in the lesson video transcripts',
    }),
  })
  .openapi({
    example: { q: 'Who were the romans?' },
    ref: 'SearchTranscriptRequestSchema',
  });
