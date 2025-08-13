import 'zod-openapi/extend';
import z from 'zod';

export const searchTranscriptRequestOpenAPISchema = z.object({
  q: z
    .string()
    .openapi({
      example: 'Who were the romans?',
      description:
        'A snippet of text to search for in the lesson video transcripts',
    }),
});
