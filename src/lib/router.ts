import { router } from '~/lib/trpc';

import { getAllKeyStageAndSubjectUnits } from './handlers/allKeyStageAndSubjectUnits';
import { changelog } from './handlers/changelog';
import { getKeyStageSubjectLessons } from './handlers/keyStageSubjectLessons';
import { getKeyStages } from './handlers/keyStages';
import { getLessons } from './handlers/lesson';
import { getQuestions } from './handlers/questions';
import { getUnits } from './handlers/units';
import { subjects } from './handlers/subjects';
import { getAssets } from './handlers/assets';
import { getDownloads } from './handlers/download';
import { searchTranscripts } from './handlers/searchTranscripts';
import { getLessonTranscript } from './handlers/transcript';

export default router({
  getLessonTranscript,
  searchTranscripts,
  getDownloads,
  getAssets,
  subjects,
  getKeyStages,
  getKeyStageSubjectLessons,
  getAllKeyStageAndSubjectUnits,
  getQuestions,
  getLessons,
  getUnits,
  changelog,
});
