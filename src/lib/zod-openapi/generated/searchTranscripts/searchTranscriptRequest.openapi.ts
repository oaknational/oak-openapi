import * as z from 'zod/v4';

export const searchTranscriptRequestOpenAPISchema = z.object({
  q: z.string().meta({
    description:
      'A snippet of text to search for in the lesson video transcripts',
    example: 'Who were the romans?',
  }),
});
