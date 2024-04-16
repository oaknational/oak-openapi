import { GraphQLClient } from "graphql-request";

export { gql } from "graphql-request";

export function getClient() {
  return new GraphQLClient(`https://hasura.thenational.academy/v1/graphql`, {
    headers: {
      "x-oak-auth-key": process.env.OAK_GRAPHQL_SECRET as string,
      "x-oak-auth-type": "oak-admin",
    },
  });
}

export const unitCurriculumView =
  "published_mv_openapi_unit_curriculum_content_1_0_1";

export type UnitCurriculumView = {
  published_mv_openapi_unit_curriculum_content_1_0_1: UnitCurriculum[];
};

export type UnitCurriculum = {
  unitSlug: string;
  unitTitle: string;
  unitTags: UnitTag[];
  unitNotes: string;
  unitDescription: string;
  plannedNumberOfLessons: number;
  priorKnowledgeRequirements: string[];
  unitNationalCurriculumContent: UnitNationalCurriculumContent[];
  priorUnits: PriorUnit[];
  futureUnits: FutureUnit[];
  connectionFutureUnitDescription: string;
  connectionPriorUnitDescription: string;
};

export interface UnitTag {
  id: number;
  title: string;
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

export const lessonView = "published_mv_lesson_openapi_1_0_0";

export type LessonView = {
  published_mv_lesson_openapi_1_0_0: Lesson[];
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
  keyLearningPonumbers?: any;
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
};

export interface Question {
  hint: string;
  active: boolean;
  answers: Answers;
  feedback: string;
  questionId: number;
  questionUid: string;
  questionStem: QuestionStem[];
  questionType: QuestionType;
}

export enum QuestionType {
  MultipleChoice = "multiple-choice",
  // etc
}

export type Answers = {
  [key in QuestionType]?: Answer[];
};

export interface Answer {
  answer: AnswerStem[];
  answer_is_correct: boolean;
}

export interface AnswerStem {
  text: string;
  type: string;
}

export interface QuestionStem {
  text: string;
  type: string;
}
