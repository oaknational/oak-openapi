import z from 'zod';
import 'zod-openapi/extend';

export const lessonSearchResultSchema = z.object({
  lessonSlug: z.string({ description: 'The lesson slug identifier' }),
  lessonTitle: z.string({ description: 'The lesson title' }),
  similarity: z.number({
    description: 'The snippet of the transcript that matched the search term',
  }),
  units: z.array(
    z.object({
      unitSlug: z.string(),
      unitTitle: z.string(),
      examBoardTitle: z.string().or(z.null()),
      keyStageSlug: z.string(),
      subjectSlug: z.string(),
    }),
    { description: 'The units that the lesson is part of' },
  ),
});

export type LessonSearchResultType = z.infer<typeof lessonSearchResultSchema>;

export const lessonSearchResponseSchema = z.array(lessonSearchResultSchema);

export type LessonSearchResponseType = z.infer<
  typeof lessonSearchResponseSchema
>;
