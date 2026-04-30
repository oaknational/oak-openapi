import * as z from 'zod/v4';
import type { Lesson, Sequence, UnitVariantLesson } from '@/lib/owaClient';

export const unitProgrammeFactorOptionSchema = z.object({
  slug: z.string().describe('The slug identifier for the programme factor'),
  title: z.string().describe('The title of the programme factor'),
});

export const unitProgrammeFactorsSchema = z.object({
  examBoard: unitProgrammeFactorOptionSchema
    .optional()
    .describe('The exam board that identifies this unit variant'),
  pathway: unitProgrammeFactorOptionSchema
    .optional()
    .describe('The pathway that identifies this unit variant'),
  tier: unitProgrammeFactorOptionSchema
    .optional()
    .describe('The tier that identifies this unit variant'),
});

export type UnitProgrammeFactors = z.infer<typeof unitProgrammeFactorsSchema>;

const examBoardTitleBySlug: Record<string, string> = {
  aqa: 'AQA',
  edexcel: 'Edexcel',
  eduqas: 'Eduqas',
  ocr: 'OCR',
  edexcelb: 'Edexcel B',
};

const pathwayTitleBySlug: Record<string, string> = {
  gcse: 'GCSE',
  core: 'Core',
};

const tierTitleBySlug: Record<string, string> = {
  foundation: 'Foundation',
  higher: 'Higher',
};

function buildUnitProgrammeFactors(args: {
  examBoardSlug?: string | null;
  examBoardTitle?: string | null;
  pathwaySlug?: string | null;
  pathwayTitle?: string | null;
  tierSlug?: string | null;
  tierTitle?: string | null;
}): UnitProgrammeFactors | undefined {
  const factors = {
    examBoard:
      args.examBoardSlug && args.examBoardTitle
        ? {
            slug: args.examBoardSlug,
            title: args.examBoardTitle,
          }
        : undefined,
    pathway:
      args.pathwaySlug && args.pathwayTitle
        ? {
            slug: args.pathwaySlug,
            title: args.pathwayTitle,
          }
        : undefined,
    tier:
      args.tierSlug && args.tierTitle
        ? {
            slug: args.tierSlug,
            title: args.tierTitle,
          }
        : undefined,
  } satisfies UnitProgrammeFactors;

  return Object.values(factors).some(Boolean) ? factors : undefined;
}

export function getUnitProgrammeFactorsFromSequence(
  sequence: Pick<
    Sequence,
    | 'examboard_slug'
    | 'examboard'
    | 'pathway_slug'
    | 'pathway'
    | 'tier_slug'
    | 'tier'
  >,
): UnitProgrammeFactors | undefined {
  return buildUnitProgrammeFactors({
    examBoardSlug: sequence.examboard_slug,
    examBoardTitle: sequence.examboard,
    pathwaySlug: sequence.pathway_slug,
    pathwayTitle: sequence.pathway,
    tierSlug: sequence.tier_slug,
    tierTitle: sequence.tier,
  });
}

export function getUnitProgrammeFactorsFromLesson(
  lesson: Pick<
    Lesson,
    'examBoardSlug' | 'examBoardTitle' | 'tierSlug' | 'tierTitle'
  >,
): UnitProgrammeFactors | undefined {
  return buildUnitProgrammeFactors({
    examBoardSlug: lesson.examBoardSlug,
    examBoardTitle: lesson.examBoardTitle,
    tierSlug: lesson.tierSlug,
    tierTitle: lesson.tierTitle,
  });
}

export function getUnitProgrammeFactorsFromUnitVariantLesson(
  row: Pick<UnitVariantLesson, 'examboard_slug' | 'examboard_title'>,
): UnitProgrammeFactors | undefined {
  return buildUnitProgrammeFactors({
    examBoardSlug: row.examboard_slug,
    examBoardTitle: row.examboard_title,
  });
}

export function getUnitProgrammeFactorsFromKnownSlugs(args: {
  examBoardSlug?: string | null;
  pathwaySlug?: string | null;
  tierSlug?: string | null;
}): UnitProgrammeFactors | undefined {
  return buildUnitProgrammeFactors({
    examBoardSlug: args.examBoardSlug,
    examBoardTitle: args.examBoardSlug
      ? examBoardTitleBySlug[args.examBoardSlug]
      : undefined,
    pathwaySlug: args.pathwaySlug,
    pathwayTitle: args.pathwaySlug
      ? pathwayTitleBySlug[args.pathwaySlug]
      : undefined,
    tierSlug: args.tierSlug,
    tierTitle: args.tierSlug ? tierTitleBySlug[args.tierSlug] : undefined,
  });
}

export function getUnitProgrammeFactorsSignature(
  factors?: UnitProgrammeFactors,
): string {
  if (!factors) {
    return '';
  }

  return JSON.stringify({
    examBoard: factors.examBoard?.slug ?? null,
    pathway: factors.pathway?.slug ?? null,
    tier: factors.tier?.slug ?? null,
  });
}
