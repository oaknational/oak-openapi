import { router } from '~/lib/trpc';

import { getAllKeyStageAndSubjectUnits } from './handlers/allKeyStageAndSubjectUnits';
import { changelog } from './handlers/changelog';
import { getKeyStageSubjectLessons } from './handlers/keyStageSubjectLessons';
import { getKeyStages } from './handlers/keyStages';
import { getLessons } from './handlers/lesson';
import { getQuestions } from './handlers/questions';
import { getUnits } from './handlers/units';
import { subjectsRouter } from './handlers/subjects';
import { getAssets } from './handlers/assets';

export default router({
  getAssets,
  subjectsRouter,
  getKeyStages,
  getKeyStageSubjectLessons,
  getAllKeyStageAndSubjectUnits,
  getQuestions,
  getLessons,
  getUnits,
  changelog,
});
