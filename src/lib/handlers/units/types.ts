import * as z from 'zod/v4';
import type { unitSummaryResponseSchema } from './schemas/unitSummaryResponse.schema';

export const threadSchema = z.object({
  slug: z.string(),
  title: z.string(),
  order: z.number(),
});

export type Thread = z.infer<typeof threadSchema>;

export const categorySchema = z.object({
  categoryTitle: z.string(),
  categorySlug: z.string().optional(),
});

export type Category = z.infer<typeof categorySchema>;

export type UnitSchema = z.infer<typeof unitSummaryResponseSchema> & {
  examboardSlug?: string;
  examboard?: string;
};

export type BulkUnitSchema = UnitSchema & Metadata;

export interface Metadata {
  unitTitle: string;
  year: number | 'All years';
  yearSlug: string;
  phaseSlug: string;
  subjectSlug: string;
  keyStageSlug: string;
  unitLessons: {
    lessonSlug: string;
    lessonTitle: string;
    lessonOrder: number;
    state: 'published' | 'new';
  }[];

  examboard?: string;
  examboardSlug?: string;
  pathway?: string;
  pathwaySlug?: string;

  tier?: {
    tierSlug: string;
    tierTitle: string;
  };

  examSubjects?: {
    examSubjectSlug: string;
    examSubjectTitle: string;
  }[];

  unitOptionGroup?: string;

  tier?: {
    tierSlug: string;
    tierTitle: string;
  };

  examSubject?: {
    examSubjectSlug: string;
    examSubjectTitle: string;
  }[];

  unitOptionGroup?: string;

  // cycle 2
  whyThisWhyNow?: string;
  description?: string;
}
