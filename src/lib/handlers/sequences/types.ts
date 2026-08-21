import * as z from 'zod/v4';

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
  categoryTitle: z.string().meta({ description: 'The title of the category' }),
  categorySlug: z
    .string()
    .optional()
    .meta({ description: 'The unique identifier for the category' }),
});

const threadSchema = z.object({
  threadTitle: z.string().meta({ description: 'The title of the category' }),
  threadSlug: z
    .string()
    .meta({ description: 'The unique identifier for the thread' }),
  order: z.number().meta({ description: 'Deprecated' }),
});

const unitOptionSchema = z.object({
  unitTitle: z.string(),
  unitSlug: z.string(),
});

const examBoardSchema = z.object({
  title: z.string().meta({ description: 'The title of the exam board' }),
  slug: z.string().meta({ description: 'The slug of the exam board' }),
});

const unitWithOptionsSchema = z.object({
  unitTitle: z.string().meta({ description: 'The title of the unit' }),
  unitOrder: z
    .number()
    .meta({ description: 'The position of the unit within the sequence.' }),
  unitOptions: z
    .array(unitOptionSchema)
    .meta({ description: 'The unique slug identifier for the unit' }),
  categories: z.array(categorySchema).optional().meta({
    description:
      'The categories (if any) that are assigned to the unit. If the unit does not have any categories, this property is omitted.',
  }),
  threads: z.array(threadSchema).optional().meta({
    description:
      'A list of threads (if any) that are assigned to the unit. If the unit does not have any categories, this property is omitted.',
  }),
  examBoards: z.array(examBoardSchema).optional().meta({
    description:
      'The exam boards the unit appears in. Only populated when the sequence is requested without an exam board (e.g. `science-secondary` rather than `science-secondary-aqa`).',
  }),
});

const unitNoOptionsSchema = z.object({
  unitTitle: z.string(),
  unitOrder: z.number(),
  unitSlug: z
    .string()
    .meta({ description: 'The unique slug identifier for the unit' }),
  categories: z.array(categorySchema).optional(),
  threads: z.array(threadSchema).optional(),
  examBoards: z.array(examBoardSchema).optional().meta({
    description:
      'The exam boards the unit appears in. Only populated when the sequence is requested without an exam board (e.g. `science-secondary` rather than `science-secondary-aqa`).',
  }),
});

const unitSchema = z.union([unitWithOptionsSchema, unitNoOptionsSchema]);

const tierSchema = z.object({
  tierTitle: z.string().meta({ description: 'The title of the tier' }),
  tierSlug: z.string().meta({ description: 'The tier identifier' }),
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
  title: z.string().optional(),
  examSubjects: z
    .array(
      z.union([examSubjectsSchemaWithTiers, examSubjectsSchemaWithoutTiers]),
    )
    .meta({
      description:
        "Only used in secondary science. Contains a full year's unit sequences based on which subject is being studied at KS4.",
    }),
});

const yearSequenceKS4WithoutExamSubjectsSchema = z.object({
  year: z.number(),
  title: z.string().optional(),
  tiers: z.array(tierSchema),
});

const yearSequenceSchema = z.object({
  year: z
    .union([z.number(), z.literal('all-years')])
    .meta({ description: 'The year group' }),
  title: z
    .string()
    .meta({
      description: 'An optional alternative title for the year sequence',
    })
    .optional(),
  units: z.array(unitSchema).meta({
    description:
      'A list of units that make up a full sequence, grouped by year.',
  }),
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

export const sequenceSlugSchema = z.string().meta({
  description:
    'The sequence slug identifier, including the key stage 4 option where relevant.',
  example: 'english-primary',
});

export const sequenceYearSchema = z
  .string()
  .meta({
    description:
      'The year group to filter by. For the physical-education-primary sequence, a value of all-years can also be used.',
    example: 3,
  })
  .optional();

export const sequenceYearEnumSchema = z
  .enum(years as [string])
  .meta({
    description:
      'The year group to filter by. For the physical-education-primary sequence, a value of all-years can also be used.',
    example: '1',
  })
  .optional();
