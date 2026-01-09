import * as z from 'zod/v4';

export const searchTranscriptResponseSchema = z.array(
  z.object({
    lessonTitle: z.string({ description: 'The lesson title' }),
    lessonSlug: z.string({ description: 'The lesson slug identifier' }),
    transcriptSnippet: z
      .string({
        description:
          'The snippet of the transcript that matched the search term',
      })
      .optional(),
  }),
);
