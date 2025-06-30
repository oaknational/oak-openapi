import z from 'zod';

export const lessonSearchResultSchema = z.object({
  lessonSlug: z.string(),
  lessonTitle: z.string(),
  similarity: z.number(),
  units: z.array(
    z.object({
      unitSlug: z.string(),
      unitTitle: z.string(),
      examBoardTitle: z.string().or(z.null()),
      keyStageSlug: z.string(),
      subjectSlug: z.string(),
    }),
  ),
});

export type LessonSearchResultType = z.infer<typeof lessonSearchResultSchema>;

export const lessonSearchResponseSchema = z.array(
  z.object({
    lessonSlug: z.string(),
    lessonTitle: z.string(),
    similarity: z.number(),
    units: z.array(
      z.object({
        unitSlug: z.string(),
        unitTitle: z.string(),
        examBoardTitle: z.string().or(z.null()),
        keyStageSlug: z.string(),
        subjectSlug: z.string(),
      }),
    ),
  }),
);

export type LessonSearchResponseType = z.infer<
  typeof lessonSearchResponseSchema
>;
