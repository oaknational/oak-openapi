import 'zod-openapi/extend';
import z from 'zod';

export const searchTranscriptResponseOpenAPISchema = z
  .array(
    z.object({
      lessonTitle: z
        .string()
        .openapi({ example: undefined, description: 'The lesson title' }),
      lessonSlug: z
        .string()
        .openapi({ description: 'The lesson slug identifier' }),
      transcriptSnippet: z.string().optional().openapi({
        description:
          'The snippet of the transcript that matched the search term',
      }),
    }),
  )
  .openapi({
    ref: 'SearchTranscriptResponseSchema',
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
