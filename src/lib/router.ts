import { router } from '~/lib/trpc';

import { getAllKeyStageAndSubjectUnits } from './handlers/allKeyStageAndSubjectUnits';
import { changelog } from './handlers/changelog';
import { getKeyStageSubjectLessons } from './handlers/keyStageSubjectLessons';
import { getKeyStages } from './handlers/keyStages';
import { getLessons } from './handlers/lesson';
import { getQuestions } from './handlers/questions';
import { getUnits } from './handlers/units';
import { getSubjects } from './handlers/subjects';
import { getAssets } from './handlers/assets';
import { getDownloads } from './handlers/download';
import { searchTranscripts } from './handlers/searchTranscripts';
import { getLessonTranscript } from './handlers/transcript';
import { getSequences } from './handlers/sequences';

export default router({
  getSequences,
  getLessonTranscript,
  searchTranscripts,
  getDownloads,
  getAssets,
  getSubjects,
  getKeyStages,
  getKeyStageSubjectLessons,
  getAllKeyStageAndSubjectUnits,
  getQuestions,
  getLessons,
  getUnits,
  changelog,
});
