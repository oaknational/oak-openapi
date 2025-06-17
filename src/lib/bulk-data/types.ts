import type { Pack } from 'tar-stream';
import { UnitSchema } from '@/lib/handlers/units/units';
import { TitleSlug } from '@/lib/owaClient';

export interface Lesson {
  lessonTitle: string;
  lessonSlug: string;
  unitSlug: string;
  unitTitle: string;
  subjectSlug: string;
  subjectTitle: string;
  keyStageSlug: string;
  keyStageTitle: string;
  lessonKeywords: string;
  keyLearningPoints: string;
  misconceptionsAndCommonMistakes: string;
  pupilLessonOutcome: string;
  teacherTips: string;
  contentGuidance: string;
  downloadsAvailable: boolean;
  supervisionLevel: string;
  transcript_sentences?: string;
  transcript_vtt?: string;
  supplementaryResource?: string;
  starterQuiz?: string;
  starterQuizAnswers?: string;
  exitQuiz?: string;
  exitQuizAnswers?: string;
  slideDeck?: string;
  worksheet?: string;
  worksheetAnswers?: string;
  video?: string;
}

export interface AssetPacks {
  worksheets?: Pack;
  slideDecks?: Pack;
  starterQuizzes?: Pack;
  exitQuizzes?: Pack;
  supplementaryResources?: Pack;
}

export interface LessonAsset {
  ext: string;
  type: string;
  label: string;
  bucket_name: string;
  bucket_path: string;
}

export interface LessonAssets {
  exitQuiz: LessonAsset;
  exitQuizAnswers: LessonAsset;
  slideDeck: LessonAsset;
  starterQuizAnswers: LessonAsset;
  starterQuiz: LessonAsset;
  supplementaryResource: LessonAsset;
  video: { stream: string };
  worksheet: LessonAsset;
  worksheetAnswers: LessonAsset;
  videoStream: LessonAsset;
}

export interface LessonAssetsMap {
  [lessonSlug: string]: LessonAssets;
}

export type ExamBoard = TitleSlug & { examSubjectTitle?: string };

export type UnitWithExamBoards = Omit<
  UnitSchema,
  'phaseSlug' | 'subjectSlug'
> & {
  examBoards?: ExamBoard[];
};

export interface SlimSequenceResult {
  sequenceSlug: string;
  subjectTitle: string;
  ks4Options?: TitleSlug[];
}

export type ValidDownloadTypes = 'starterQuiz' | 'exitQuiz' | 'worksheet';
