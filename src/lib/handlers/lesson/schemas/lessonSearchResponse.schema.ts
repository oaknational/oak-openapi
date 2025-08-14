import z from 'zod';
import 'zod-openapi/extend';

export const lessonSearchResultSchema = z.object({
  lessonSlug: z.string().openapi({ description: 'The lesson slug identifier' }),
  lessonTitle: z.string().openapi({ description: 'The lesson title' }),
  similarity: z.number().openapi({
    description: 'The snippet of the transcript that matched the search term',
  }),
  units: z
    .array(
      z.object({
        unitSlug: z.string(),
        unitTitle: z.string(),
        examBoardTitle: z.string().or(z.null()),
        keyStageSlug: z.string(),
        subjectSlug: z.string(),
      }),
    )
    .openapi({
      description:
        'The units that the lesson is part of. See sample response below',
    }),
});

export type LessonSearchResultType = z.infer<typeof lessonSearchResultSchema>;

export const lessonSearchResponseSchema = z.array(lessonSearchResultSchema);

export type LessonSearchResponseType = z.infer<
  typeof lessonSearchResponseSchema
>;
