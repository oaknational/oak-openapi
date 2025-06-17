import { router } from '@/lib/trpc';

import { getAllKeyStageAndSubjectUnits } from './handlers/allKeyStageAndSubjectUnits/allKeyStageAndSubjectUnits';
import { changelog } from './handlers/changelog';
import { getKeyStageSubjectLessons } from './handlers/keyStageSubjectLessons';
import { getKeyStages } from './handlers/keyStages';
import { getLessons } from './handlers/lesson/lesson';
import { getQuestions } from './handlers/questions/questions';
import { getUnits } from './handlers/units';
import { getSubjects } from './handlers/subjects';
import { getAssets } from './handlers/assets/assets';
import { searchTranscripts } from './handlers/searchTranscripts';
import { getLessonTranscript } from './handlers/transcript';
import { getSequences } from './handlers/sequences/sequences';
import { getThreads } from './handlers/threads';
import { getRateLimit } from './handlers/rate';

export default router({
  getSequences,
  getLessonTranscript,
  searchTranscripts,
  getAssets,
  getSubjects,
  getKeyStages,
  getKeyStageSubjectLessons,
  getAllKeyStageAndSubjectUnits,
  getQuestions,
  getLessons,
  getUnits,
  getThreads,
  changelog,
  getRateLimit,
});
