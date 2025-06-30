import z from 'zod';

export const lessonSummaryRequestSchema = z.object({
  lesson: z.string({ description: 'The slug of the lesson' }),
});

export type LessonSummaryRequestType = z.infer<
  typeof lessonSummaryRequestSchema
>;
