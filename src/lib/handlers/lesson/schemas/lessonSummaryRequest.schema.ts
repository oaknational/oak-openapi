import * as z from 'zod/v4';

export const lessonSummaryRequestSchema = z.object({
  lesson: z.string({ description: 'The slug of the lesson' }),
});

export type LessonSummaryRequestType = z.infer<
  typeof lessonSummaryRequestSchema
>;
