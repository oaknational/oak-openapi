import { z } from 'zod';

export type SequenceSchema = z.infer<typeof sequenceSchema>;
export type YearSequence = z.infer<typeof yearSequenceSchema>;
export type ExamSubjectsWithTiers = z.infer<typeof examSubjectsSchemaWithTiers>;
export type ExamSubjectsWithoutTiers = z.infer<
  typeof examSubjectsSchemaWithoutTiers
>;
export type Tier = z.infer<typeof tierSchema>;
export type Category = z.infer<typeof categorySchema>;
export type yearSequenceKS4WithExamSubjects = z.infer<
  typeof yearSequenceKS4WithExamSubjectsSchema
>;
export type UnitWithOptions = z.infer<typeof unitWithOptionsSchema>;
export type UnitWithoutOptions = z.infer<typeof unitNoOptionsSchema>;
export type Unit = z.infer<typeof unitSchema>;

const categorySchema = z.object({
  categoryTitle: z.string(),
  categorySlug: z.string().optional(),
});

const threadSchema = z.object({
  threadTitle: z.string(),
  threadSlug: z.string(),
  order: z.number(),
});

const unitOptionSchema = z.object({
  unitTitle: z.string(),
  unitSlug: z.string(),
});

const unitWithOptionsSchema = z.object({
  unitTitle: z.string(),
  unitOrder: z.number(),
  unitOptions: z.array(unitOptionSchema),
  categories: z.array(categorySchema).optional(),
  threads: z.array(threadSchema).optional(),
});

const unitNoOptionsSchema = z.object({
  unitTitle: z.string(),
  unitOrder: z.number(),
  unitSlug: z.string(),
  categories: z.array(categorySchema).optional(),
  threads: z.array(threadSchema).optional(),
});

const unitSchema = z.union([unitWithOptionsSchema, unitNoOptionsSchema]);

const tierSchema = z.object({
  tierTitle: z.string(),
  tierSlug: z.string(),
  units: z.array(unitSchema),
});

const examSubjectsSchemaWithTiers = z.object({
  examSubjectTitle: z.string(),
  examSubjectSlug: z.string().optional(),
  tiers: z.array(tierSchema),
});

const examSubjectsSchemaWithoutTiers = z.object({
  examSubjectTitle: z.string(),
  examSubjectSlug: z.string().optional(),
  units: z.array(unitSchema),
});

const yearSequenceKS4WithExamSubjectsSchema = z.object({
  year: z.number(),
  title: z
    .string({
      description: 'Optional alternative title for the year sequence',
    })
    .optional(),
  examSubjects: z.array(
    z.union([examSubjectsSchemaWithTiers, examSubjectsSchemaWithoutTiers]),
  ),
});

const yearSequenceKS4WithoutExamSubjectsSchema = z.object({
  year: z.number(),
  title: z
    .string({
      description: 'Optional alternative title for the year sequence',
    })
    .optional(),
  tiers: z.array(tierSchema),
});

const yearSequenceSchema = z.object({
  year: z.union([z.number(), z.literal('all-years')]),
  title: z
    .string({
      description: 'Optional alternative title for the year sequence',
    })
    .optional(),
  units: z.array(unitSchema),
});

export const sequenceSchema = z.union([
  yearSequenceSchema,
  yearSequenceKS4WithExamSubjectsSchema,
  yearSequenceKS4WithoutExamSubjectsSchema,
]);

export const years = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  'all-years',
];
