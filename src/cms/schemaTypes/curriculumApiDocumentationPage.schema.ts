import { z } from 'zod';
// import { documentationQuerySchema } from '../queries/allDocumentationQuery/documentationQuery.schema';

export const curriculumApiDocumentationPageSchema = z.object({
  allCurriculumApiDocumentationPage: z.array(
    z.object({
      title: z.string(),
      navGroupType: z.object({
        slug: z.object({ current: z.string() }),
        name: z.string(),
      }),
      contentRaw: z.array(
        z.union([
          z.object({
            _key: z.string(),
            _type: z.string(),
            children: z.array(
              z.object({
                _key: z.string(),
                _type: z.string(),
                marks: z.array(z.unknown()),
                text: z.string(),
              }),
            ),
            markDefs: z.array(z.unknown()),
            style: z.string(),
          }),
          z.object({
            _key: z.string(),
            _type: z.string(),
            children: z.array(
              z.object({
                _key: z.string(),
                _type: z.string(),
                marks: z.array(z.unknown()),
                text: z.string(),
              }),
            ),
            level: z.number(),
            listItem: z.string(),
            markDefs: z.array(z.unknown()),
            style: z.string(),
          }),
        ]),
      ),
    }),
  ),
});
export type CurriculumAPIDocumentationPage = z.infer<
  typeof curriculumApiDocumentationPageSchema
>;
