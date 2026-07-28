import 'zod-openapi';
import * as z from 'zod/v4';
import { questionFilterSchema } from '../../../handlers/questions/types';
export const questionForLessonsRequestOpenAPISchema = z.object({
  lesson: z.string().describe('The lesson slug identifier').meta({
    example: 'imagining-you-are-the-characters-the-three-billy-goats-gruff',
  }),
  filter: questionFilterSchema.optional(),
});
