import 'zod-openapi';
import * as z from 'zod/v4';
export const searchTranscriptResponseOpenAPISchema = z
  .array(
    z.object({
      lessonTitle: z.string().describe('The lesson title').meta({
        example: 'The Roman invasion of Britain ',
      }),
      lessonSlug: z.string().describe('The lesson slug identifier').meta({
        example: 'the-roman-invasion-of-britain',
      }),
      transcriptSnippet: z
        .string()
        .describe('The snippet of the transcript that matched the search term')
        .optional()
        .meta({
          example: 'The Romans were ready,',
        }),
    }),
  )
  .meta({
    id: 'SearchTranscriptResponseSchema',
    example: [
      {
        lessonTitle: 'The Roman invasion of Britain ',
        lessonSlug: 'the-roman-invasion-of-britain',
        transcriptSnippet: 'The Romans were ready,',
      },
      {
        lessonTitle: 'The changes to life brought about by Roman settlement',
        lessonSlug: 'the-changes-to-life-brought-about-by-roman-settlement',
        transcriptSnippet: 'when the Romans came.',
      },
      {
        lessonTitle: "Boudica's rebellion against Roman rule",
        lessonSlug: 'boudicas-rebellion-against-roman-rule',
        transcriptSnippet: 'kings who resisted the Romans were,',
      },
      {
        lessonTitle: 'How far religion changed under Roman rule',
        lessonSlug: 'how-far-religion-changed-under-roman-rule',
        transcriptSnippet: 'for the Romans.',
      },
    ],
  });
