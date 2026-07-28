import 'zod-openapi';
import * as z from 'zod/v4';
export const searchTranscriptRequestOpenAPISchema = z.object({
  q: z
    .string()
    .describe('A snippet of text to search for in the lesson video transcripts')
    .meta({
      example: 'Who were the romans?',
    }),
});
