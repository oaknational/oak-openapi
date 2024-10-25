import { GraphQLClient } from 'graphql-request';

export { gql } from 'graphql-request';

export const unitCurriculumView =
  'published_mv_openapi_unit_curriculum_content_1_0_2';
export const lessonView = 'published_mv_lesson_openapi_1_2_1';
export const downloadView = 'published_mv_openapi_downloads_1_0_0';
export const unitVariantLessonsView =
  'published_mv_synthetic_unitvariant_lessons_by_year_12_0_0';
export const lessonViewTable = 'published.mv_lesson_openapi_1_2_1';

export const lessonDetailView = 'published_mv_lesson_content_published_3_0_0';

export function querySQL(sql: string) {
  return fetch(`${process.env.OAK_GRAPHQL_HOST}/v1/query`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-oak-auth-key': process.env.OAK_GRAPHQL_SECRET as string,
      'x-oak-auth-type': 'oak-admin',
      'x-hasura-role': 'admin',
    },
    body: JSON.stringify({
      type: 'run_sql',
      args: { source: 'Oak DB', sql, read_only: true },
    }),
  });
}

export function getClient() {
  return new GraphQLClient(`${process.env.OAK_GRAPHQL_HOST}/v1/graphql`, {
    headers: {
      'x-oak-auth-key': process.env.OAK_GRAPHQL_SECRET as string,
      'x-oak-auth-type': 'oak-admin',
    },
  });
}

export type LessonDetailView = {
  published_mv_lesson_content_published_3_0_0: LessonDetail[];
};

export type LessonDetail = {
  has_slide_deck_asset_object: boolean;
  has_worksheet_asset_object: boolean;
  has_worksheet_answers_asset_object: boolean;
  has_supplementary_asset_object: boolean;
};

export type UnitVariantLessonsView = {
  published_mv_synthetic_unitvariant_lessons_by_year_12_0_0: UnitVariantLesson[];
};

export type UnitVariantLesson = {
  lesson_slug: string;
  lesson_title: string;
  year_slug: string;
  phase_slug: string;
  keystage_slug: string;
  subject_slug: string;
  supplementary_data: {
    unit_order: number;
    order_in_unit: number;
  };
};

export type DownloadView = {
  published_mv_openapi_downloads_1_0_0: Download[];
};

export interface Download {
  exitQuiz: SignedAsset;
  exitQuizAnswers: SignedAsset;
  lessonSlug: string;
  lessonTitle: string;
  slidedeck: SignedAsset;
  starterQuizAnswers: SignedAsset;
  starterQuiz: SignedAsset; // note: this is starter_quiz in the graphql response
  supplementaryResource: SignedAsset;
  video: Video;
  worksheet: SignedAsset;
  worksheetAnswers: SignedAsset;
}

export interface SignedAsset {
  ext: string;
  type: string;
  label: string;
  bucket_name: string;
  bucket_path: string;
}

interface Video {
  ext: string;
  type: string;
  label: string;
  stream: string;
  download: string;
}

export type UnitCurriculumView = {
  published_mv_openapi_unit_curriculum_content_1_0_2: UnitCurriculum[];
};

export type UnitCurriculum = {
  unitSlug: string;
  unitTitle: string;
  unitTags?: UnitTag[];
  unitNotes: string;
  unitDescription: string;
  plannedNumberOfLessons: number;
  priorKnowledgeRequirements?: string[];
  unitNationalCurriculumContent?: UnitNationalCurriculumContent[];
  priorUnit?: PriorUnit[];
  futureUnit?: FutureUnit[];
  futureUnitDescription: string;
  priorUnitDescription: string;
  unitLessons?: UnitLesson[];
};

export interface UnitTag {
  id: number;
  title: string;
}

export interface UnitLesson {
  title: string;
  slug: string;
}

export interface UnitNationalCurriculumContent {
  id: number;
  title: string;
}

export interface PriorUnit {
  id: number;
  title: string;
  slug: string;
}

export interface FutureUnit {
  id: number;
  title: string;
  slug: string;
}

export type LessonView = {
  published_mv_lesson_openapi_1_2_1: Lesson[];
};

// Note: where any is used, the structure is currently unknown/undocumented
// whilst at the same time, not exposed - I've only included them for completeness
// and debugging - RS 2024-03-20

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Lesson = {
  additionalMaterialUrl?: string;
  contentGuidance?: any;
  copyrightContent?: any;
  examBoardSlug?: string;
  examBoardTitle?: string;
  exitQuiz?: Question[];
  exitQuizId?: number;
  hasDownloadableResources?: boolean;
  isLegacy?: boolean;
  isWorksheetLandscape?: boolean;
  keyLearningPoints?: any;
  keyStageSlug?: string;
  keyStageTitle?: string;
  lessonCohort?: string;
  lessonEquipmentAndResources?: any;
  lessonId?: number;
  lessonKeywords?: any;
  lessonSlug?: string;
  lessonTitle?: string;
  misconceptionsAndCommonMistakes?: any;
  nullUnitVariantId?: number;
  presentationUrl?: string;
  programmeSlug?: string;
  pupilLessonOutcome?: string;
  starterQuiz?: Question[];
  starterQuizId?: number;
  subjectSlug?: string;
  subjectTitle?: string;
  supervisionLevel?: string;
  teacherTips?: any;
  tierSlug?: string;
  tierTitle?: string;
  transcriptSentences?: string;
  unitSlug?: string;
  unitTitle?: string;
  unitVariantId?: number;
  videoTitle?: string;
  video_object?: any;
  worksheetUrl?: string;
  yearSlug?: string;
  yearTitle?: string;
  tpcMedia?: HasAttribution[];
  tpcWorks?: HasAttribution[];
};

export type HasAttribution = {
  attribution?: string;
};

export enum QuestionTypeEnum {
  Text = 'text',
  ExplanatoryText = 'explanatory-text',
  MultipleChoice = 'multiple-choice',
  Match = 'match',
  Order = 'order',
  ShortAnswer = 'short-answer',
}

export type Question = {
  hint: string;
  active: boolean;
  feedback: string;
  questionId: number;
  questionUid: string;
  questionStem: (TextType | ImageStem)[];
} & Answers;

export type Answers =
  | MultipleChoiceAnswerObject
  | MatchObject
  | OrderObject
  | ShortAnswerObject;

interface MultipleChoiceAnswerObject {
  questionType: QuestionTypeEnum.MultipleChoice;
  answers: { [QuestionTypeEnum.MultipleChoice]: MultipleChoiceAnswer[] };
}

interface MatchObject {
  questionType: QuestionTypeEnum.Match;
  answers: { [QuestionTypeEnum.Match]: Match[] };
}

interface OrderObject {
  questionType: QuestionTypeEnum.Order;
  answers: { [QuestionTypeEnum.Order]: OrderAnswer[] };
}

interface ShortAnswerObject {
  questionType: QuestionTypeEnum.ShortAnswer;
  answers: { [QuestionTypeEnum.ShortAnswer]: ShortAnswer[] };
}

export interface MultipleChoiceAnswer {
  answer: (TextType | ImageStem)[];
  answer_is_correct: boolean;
}

export interface ShortAnswer {
  answer: TextType[];
  answer_is_default: boolean;
}

export interface Match {
  match_option: TextType[];
  correct_choice: TextType[];
}

export interface TextType {
  type: 'text';
  text: string;
}

export interface ImageStem {
  type: 'image';
  image_object: {
    secure_url: string;
    url: string;
    width: number;
    height: number;
    context?: {
      custom?: {
        alt: string;
      };
    };
    metadata?: any;
  };
}

export interface OrderAnswer {
  answer: TextType[];
  correct_order: number;
}
