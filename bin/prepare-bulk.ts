// 1. loop through all the subjects and phases - what do about exam boards
// 2. for each sequence, download `/sequences/{subject}-{phase}/units`
// 3. for each unit, download `/units/{unit}/summary`
// 4. for each lesson in the unit, download `/lessons/{lesson}/summary`
// 5. for each lesson, also download `/lessons/{lesson}/content`
// 6. for each lesson, also download the questions `/lessons/{lesson}/quiz`
// 6. for each lesson, also download the transcript `/lessons/{lesson}/transcript`

import path from 'node:path';
import { promises as fs, createWriteStream } from 'node:fs';
import readline from 'node:readline';
import pg from 'pg';
import 'renvy';
import lodash from 'lodash';
import type { Pack } from 'tar-stream';
import tar from 'tar-stream';
import { gql } from 'graphql-request';
import { Storage } from '@google-cloud/storage';
import { sequenceWhere } from '~/lib/handlers/sequences';
import {
  currentCycle,
  DownloadView,
  downloadView,
  getClient,
  SequenceView,
  sequenceView,
  sequenceViewWhereInput,
  SubjectPhase,
  subjectPhaseView,
  SubjectPhaseView,
  TitleSlug,
} from '~/lib/owaClient';
import { formatUnitSummary, UnitSchema } from '~/lib/handlers/units';
import { getVideoFromMux } from '~/lib/handlers/assets';
import {
  isLessonSupported,
  isSubjectSupported,
  isUnitSupported,
} from '~/lib/queryGate';
import { parseSubjectPhaseSlug } from '~/lib/sequenceSlugParser';

if (process.version < 'v22') {
  // this is because node 18 leaves sockets open 😱
  console.error('Node version 22 or higher is required');
  process.exit(1);
}

// Function to wait for user input
async function waitForEnter(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('Press Enter to continue...', () => {
      rl.close();
      resolve();
    });
  });
}

// if there's an argv[2] then capture is an filter the sequences to this single
// subject and phase
let subjectPhaseFilter: string | undefined;
if (process.argv.length > 2) {
  subjectPhaseFilter = process.argv[2];

  const phase = subjectPhaseFilter.split('-').pop() as string;
  if (!['primary', 'secondary'].includes(phase)) {
    console.error('Invalid phase provided: must be "primary" or "secondary"');
    process.exit(1);
  }
}

console.log('Also remember to start ./bulk-download-videos.sh. Ready?');
await waitForEnter();

// Initialize Google Cloud Storage
let storage: Storage;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  const credentials = JSON.parse(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
  );
  storage = new Storage({ credentials });
} else {
  storage = new Storage();
}

const __dirname = path.resolve(path.dirname(''));
const start = Date.now();
const client = getClient();

const db = new pg.Client(process.env.DATABASE_URL);
log('Connecting to database...');
await db.connect();

log('Database connected');

interface AssetPacks {
  worksheets?: Pack;
  slideDecks?: Pack;
  starterQuizzes?: Pack;
  exitQuizzes?: Pack;
  supplementaryResources?: Pack;
}

async function addURLToQueue(
  url: string,
  filename: string,
  sequence: string,
): Promise<void> {
  // this is picked up by build-bulk-download-videos.sh
  await fs.appendFile(
    `${__dirname}/videos.tsv`,
    `${url}\t${filename}\t${sequence}\n`,
  );
}

async function addStorageAssetToTar(
  pack: Pack,
  asset: LessonAsset,
  filename: string,
): Promise<void> {
  if (!asset || !asset.bucket_name || !asset.bucket_path) {
    throw new Error(`Invalid asset data: ${JSON.stringify(asset)}`);
  }

  const { bucket_name, bucket_path } = asset;

  // First, get the file metadata to determine its size
  const file = storage.bucket(bucket_name).file(bucket_path);

  try {
    const [metadata] = await file.getMetadata();
    const size = metadata.size ? parseInt(metadata.size + '', 10) : undefined;

    return new Promise<void>((resolve, reject) => {
      const nodeStream = file.createReadStream();
      const entry = pack.entry(
        {
          name: filename,
          size: size,
        },
        (err) => {
          if (err) reject(err);
          else resolve(void 0);
        },
      );

      nodeStream.pipe(entry);
      nodeStream.on('error', (err: Error) => {
        logError(`Stream error: ${err}`);
        reject(err);
      });
    });
  } catch (error) {
    logError(`Error getting file metadata: ${error}`);
    throw error;
  }
}

function runtime() {
  // returns hours, minutes, seconds since start
  const elapsed = Date.now() - start;
  const seconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  // returns in the format of 00:03:00
  return [hours, minutes % 60, seconds % 60]
    .map((num) => num.toString().padStart(2, '0'))
    .join(':');
}

function log(message: string): void {
  console.log(`[${runtime()}][INFO] ${message}`);
}

function logError(message: string): void {
  console.error(`[${runtime()}][ERROR] ${message}`);
}

/**
 * Check if the given lesson's assets should be processed based on subject and unit gating
 */
function isLessonAssetsAllowed(lesson: {
  subjectSlug: string;
  unitSlug: string;
  lessonSlug: string;
}): boolean {
  const { subjectSlug, unitSlug, lessonSlug } = lesson;

  if (isLessonSupported(lessonSlug)) {
    return true;
  }

  // Check if subject is supported or unit is in allowed list
  return isSubjectSupported(subjectSlug) || isUnitSupported(unitSlug);
}

const deepSearchAll = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: any,
  key: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cond?: (_?: any) => boolean,
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let results: any = [];
  if (lodash.isObject(obj)) {
    if (lodash.has(obj, key)) {
      if (!cond || cond(obj)) {
        results.push(lodash.get(obj, key));
      }
    }
    lodash.forOwn(obj, (value) => {
      if (lodash.isObject(value)) {
        results = results.concat(deepSearchAll(value, key, cond));
      }
    });
  }
  return results;
};

async function getUnitSummaries(
  slug: string,
  sequence: UnitSchema[],
  packs: AssetPacks,
) {
  // Ensure the sequence directory exists
  const sequenceDir = `${__dirname}/out/${slug}`;
  await fs.mkdir(sequenceDir, { recursive: true });

  // walk sequence and at the lowest level, get the units array
  const unitSlugs: string[] = deepSearchAll(sequence, 'unitSlug');

  // Initialize counters for tracking progress
  let totalLessons = 0;
  let completedLessons = 0;

  // First get total lesson count across all units
  for (const unitSlug of unitSlugs) {
    const lessons = await getAllLessonData(unitSlug);
    totalLessons += lessons.length;
  }

  log(`Found ${totalLessons} total lessons to process`);

  for (const unitSlug of unitSlugs) {
    const unit = getUnit(sequence, unitSlug);

    if (!unit) {
      logError(`Unit not found: ${unitSlug}`);
      continue;
    }

    const lessonData = await getAllLessonData(unitSlug);
    log(`Processing unit: ${unitSlug} with ${lessonData.length} lessons`);

    // TODO decide whether to slim this down as it includes redundant data,
    // such as the sequence year, etc.
    await fs.appendFile(`${sequenceDir}/units.jsonl`, JSON.stringify(unit));

    const assetLinks = await getAllLessonAssets(
      lessonData.map((_) => _.lessonSlug),
    );

    for (const lesson of lessonData) {
      // Check if this lesson's assets are allowed based on subject/unit gating
      const assetsAllowed = isLessonAssetsAllowed(lesson);
      if (!assetsAllowed) {
        log(
          `Skipping assets for lesson ${lesson.lessonSlug} - not in allowed subjects/units list`,
        );
        continue;
      }

      // Process video
      try {
        const videoStart = Date.now();
        // Get video URL
        const url = await getVideoFromMux(
          assetLinks[lesson.lessonSlug].videoStream as unknown as string,
        );

        await addURLToQueue(url, `${lesson.lessonSlug}.mp4`, slug);
        const totalVideoTime = Date.now() - videoStart;

        log(`Video processed: ${lesson.lessonSlug} (${totalVideoTime}ms)`);

        lesson.video = `${slug}-videos.tar:${lesson.lessonSlug}.mp4`;
      } catch (e) {
        logError(`Failed to process video for ${lesson.lessonSlug}: ${e}`);
      }

      // Process worksheet if available and has bucket_name
      if (
        assetLinks[lesson.lessonSlug].worksheet &&
        assetLinks[lesson.lessonSlug].worksheet.bucket_name &&
        packs.worksheets
      ) {
        try {
          const worksheetStart = Date.now();
          await addStorageAssetToTar(
            packs.worksheets,
            assetLinks[lesson.lessonSlug].worksheet,
            `${lesson.lessonSlug}_worksheet.pdf`,
          );

          lesson.worksheet = `${slug}-worksheets.tar:${lesson.lessonSlug}_worksheet.pdf`;

          const worksheetTime = Date.now() - worksheetStart;
          log(`Worksheet processed: ${lesson.lessonSlug} (${worksheetTime}ms)`);
        } catch (e) {
          logError(
            `Failed to process worksheet for ${lesson.lessonSlug}: ${e}`,
          );
          logError(
            `Worksheet data: ${JSON.stringify(assetLinks[lesson.lessonSlug].worksheet)}`,
          );
          logError(
            `Full asset data: ${JSON.stringify(assetLinks[lesson.lessonSlug])}`,
          );
        }
      }

      // Process worksheet answers if available and has bucket_name
      if (
        assetLinks[lesson.lessonSlug].worksheetAnswers &&
        assetLinks[lesson.lessonSlug].worksheetAnswers.bucket_name &&
        packs.worksheets
      ) {
        try {
          await addStorageAssetToTar(
            packs.worksheets,
            assetLinks[lesson.lessonSlug].worksheetAnswers,
            `${lesson.lessonSlug}_worksheet_answers.pdf`,
          );

          lesson.worksheetAnswers = `${slug}-worksheets.tar:${lesson.lessonSlug}_worksheet_answers.pdf`;
        } catch (e) {
          logError(
            `Failed to process worksheet answers for ${lesson.lessonSlug}: ${e}`,
          );
          logError(
            `Worksheet answers data: ${JSON.stringify(assetLinks[lesson.lessonSlug].worksheetAnswers)}`,
          );
        }
      }

      // Process slide deck if available and has bucket_name - replace extension with PPTX
      if (
        assetLinks[lesson.lessonSlug].slideDeck &&
        assetLinks[lesson.lessonSlug].slideDeck.bucket_name &&
        packs.slideDecks
      ) {
        try {
          const slideDeckStart = Date.now();
          const slideDeck = assetLinks[lesson.lessonSlug].slideDeck;

          // Make a copy of the slideDeck object with modified bucket_path
          const modifiedSlideDeck = { ...slideDeck };

          // Replace the extension in the bucket_path with PPTX
          const parts = modifiedSlideDeck.bucket_path.split('/');
          parts.pop(); // drop the filename
          modifiedSlideDeck.bucket_path = parts.join('/') + '/PowerPoint.pptx';

          await addStorageAssetToTar(
            packs.slideDecks,
            modifiedSlideDeck,
            `${lesson.lessonSlug}_slide_deck.pptx`,
          );

          lesson.slideDeck = `${slug}-slide-decks.tar:${lesson.lessonSlug}_slide_deck.pptx`;

          const slideDeckTime = Date.now() - slideDeckStart;
          log(
            `Slide deck processed: ${lesson.lessonSlug} (${slideDeckTime}ms)`,
          );
        } catch (e) {
          logError(
            `Failed to process slide deck for ${lesson.lessonSlug}: ${e}`,
          );
          logError(
            `Slide deck data: ${JSON.stringify(assetLinks[lesson.lessonSlug].slideDeck)}`,
          );
        }
      }

      // Process starter quiz if available and has bucket_name
      if (
        assetLinks[lesson.lessonSlug].starterQuiz &&
        assetLinks[lesson.lessonSlug].starterQuiz.bucket_name &&
        packs.starterQuizzes
      ) {
        try {
          await addStorageAssetToTar(
            packs.starterQuizzes,
            assetLinks[lesson.lessonSlug].starterQuiz,
            `${lesson.lessonSlug}_starter_quiz.pdf`,
          );

          lesson.starterQuiz = `${slug}-quizzes.tar:${lesson.lessonSlug}_starter_quiz.pdf`;

          // Process starter quiz answers if available and has bucket_name
          if (
            assetLinks[lesson.lessonSlug].starterQuizAnswers &&
            assetLinks[lesson.lessonSlug].starterQuizAnswers.bucket_name
          ) {
            await addStorageAssetToTar(
              packs.starterQuizzes,
              assetLinks[lesson.lessonSlug].starterQuizAnswers,
              `${lesson.lessonSlug}_starter_quiz_answers.pdf`,
            );

            lesson.starterQuizAnswers = `${slug}-quizzes.tar:${lesson.lessonSlug}_starter_quiz_answers.pdf`;
          }

          log(`Starter quiz processed: ${lesson.lessonSlug}`);
        } catch (e) {
          logError(
            `Failed to process starter quiz for ${lesson.lessonSlug}: ${e}`,
          );
          logError(
            `Starter quiz data: ${JSON.stringify(assetLinks[lesson.lessonSlug].starterQuiz)}`,
          );
        }
      }

      // Process exit quiz if available and has bucket_name
      if (
        assetLinks[lesson.lessonSlug].exitQuiz &&
        assetLinks[lesson.lessonSlug].exitQuiz.bucket_name &&
        packs.exitQuizzes
      ) {
        try {
          await addStorageAssetToTar(
            packs.exitQuizzes,
            assetLinks[lesson.lessonSlug].exitQuiz,
            `${lesson.lessonSlug}_exit_quiz.pdf`,
          );

          lesson.exitQuiz = `${slug}-quizzes.tar:${lesson.lessonSlug}_exit_quiz.pdf`;

          // Process exit quiz answers if available and has bucket_name
          if (
            assetLinks[lesson.lessonSlug].exitQuizAnswers &&
            assetLinks[lesson.lessonSlug].exitQuizAnswers.bucket_name
          ) {
            await addStorageAssetToTar(
              packs.exitQuizzes,
              assetLinks[lesson.lessonSlug].exitQuizAnswers,
              `${lesson.lessonSlug}_exit_quiz_answers.pdf`,
            );

            lesson.exitQuizAnswers = `${slug}-quizzes.tar:${lesson.lessonSlug}_exit_quiz_answers.pdf`;
          }

          log(`Exit quiz processed: ${lesson.lessonSlug}`);
        } catch (e) {
          logError(
            `Failed to process exit quiz for ${lesson.lessonSlug}: ${e}`,
          );
          logError(
            `Exit quiz data: ${JSON.stringify(assetLinks[lesson.lessonSlug].exitQuiz)}`,
          );
        }
      }

      // Process supplementary resource if available and has bucket_name
      if (
        assetLinks[lesson.lessonSlug].supplementaryResource &&
        assetLinks[lesson.lessonSlug].supplementaryResource.bucket_name &&
        packs.supplementaryResources
      ) {
        try {
          await addStorageAssetToTar(
            packs.supplementaryResources,
            assetLinks[lesson.lessonSlug].supplementaryResource,
            `${lesson.lessonSlug}_supplementary.pdf`,
          );

          lesson.supplementaryResource = `${slug}-resources.tar:${lesson.lessonSlug}_supplementary.pdf`;

          log(`Supplementary resource processed: ${lesson.lessonSlug}`);
        } catch (e) {
          logError(
            `Failed to process supplementary resource for ${lesson.lessonSlug}: ${e}`,
          );
          logError(
            `Supplementary resource data: ${JSON.stringify(assetLinks[lesson.lessonSlug].supplementaryResource)}`,
          );
        }
      }

      try {
        await fs.appendFile(
          `${sequenceDir}/lessons.jsonl`,
          JSON.stringify(lesson),
        );

        completedLessons++;
        log(
          `${completedLessons}/${totalLessons} completed lesson: ${lesson.lessonSlug}`,
        );
      } catch (error) {
        logError(`Failed processing lesson ${lesson.lessonSlug}: ${error}`);
      }
    }
  }
}

interface LessonAsset {
  ext: string;
  type: string;
  label: string;
  bucket_name: string;
  bucket_path: string;
}

interface LessonAssets {
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

export async function getAllLessonAssets(
  lessonSlugs: string[],
): Promise<Record<string, LessonAssets>> {
  const query = gql`
      query GetDownloads($slugs: [String!]!) {
        ${downloadView}(
          where: {
            lessonSlug: { _in: $slugs }
          }
        ) {
          lessonSlug
          exitQuiz
          exitQuizAnswers
          slideDeck: slidedeck
          starterQuizAnswers
          starterQuiz: starter_quiz
          supplementaryResource
          video: videos
          worksheet
          worksheetAnswers
        }
      }
    `;

  const variables = {
    slugs: lessonSlugs,
  };

  const res: DownloadView = await client.request(query, variables);

  // map res so that it's slug -> all assets
  const map = res[downloadView].reduce(
    (acc, assets) => {
      const { lessonSlug, ...allAssets } = assets;

      // Extract video stream specifically for backward compatibility
      const videoStream = assets.video?.stream || null;

      acc[lessonSlug] = {
        ...allAssets,
        // @ts-expect-error not worth sorting out the type discrepancy
        videoStream,
      };

      return acc;
    },
    {} as Record<string, LessonAssets>,
  );

  return map;
}

async function getAllLessonData(unitSlug: string) {
  const sql = `
    SELECT
      lessons."lessonTitle",
      lessons."lessonSlug",
      lessons."unitSlug",
      lessons."unitTitle",
      lessons."subjectSlug",
      lessons."subjectTitle",
      lessons."keyStageSlug",
      lessons."keyStageTitle",
      lessons."lessonKeywords",
      lessons."keyLearningPoints",
      lessons."misconceptionsAndCommonMistakes",
      lessons."pupilLessonOutcome",
      lessons."teacherTips",
      lessons."contentGuidance",
      lessons."hasDownloadableResources" AS downloadsAvailable,
      lessons."supervisionLevel",
      transcripts."transcript_sentences",
      transcripts."transcript_vtt"
    FROM
      published.mv_lesson_openapi_1_2_1 AS lessons,
      published.mv_lesson_content_published_5_0_0 AS transcripts
    WHERE
      lessons."lessonId" = transcripts."lesson_id"
      AND lessons."unitSlug" = $1::text
      AND transcripts."_state" = 'published'`;

  const res = await db.query({
    text: sql,
    values: [unitSlug],
    // rowMode: 'array',
  });

  return res.rows;
}

type UnitWithExamBoards = UnitSchema & {
  examBoards?: TitleSlug[];
};

async function getAllSequenceData(
  sequence: string,
  examBoards?: TitleSlug[],
): Promise<UnitWithExamBoards[]> {
  const where = sequenceWhere(sequence);
  console.log(JSON.stringify(where));
  const query = gql`
    query ($where: ${sequenceViewWhereInput}!) {
      ${sequenceView}(
        where: $where
        order_by: { order: asc }
      ) {
        title
        threads
        slug
        domain
        examboard
        examboard_slug
        keystage_slug
        order
        pathway
        pathway_slug
        phase
        subject
        subjectcategories
        subject_parent
        subject_slug
        tier
        features
        actions
        tier_slug
        unit_options
        year

        description
        lessons
        phase_slug
        why_this_why_now

      }
  }`;

  const res: SequenceView = await client.request(query, { where });

  let units = res[sequenceView].map((_) =>
    formatUnitSummary(_.slug, _),
  ) as UnitWithExamBoards[];

  // some units will appear more than once. equally, if the sequence string
  // ends with `-secondary` then we need to add the exam boards to the object
  // the duplicates need to to removed, but their exam boards need to be added
  if (examBoards) {
    const seen = new Set<string>();
    units = units.reduce((acc, unit, i, allUnits) => {
      // ignore duplicates, they've been dealt with
      if (seen.has(unit.unitSlug)) {
        return acc;
      }

      seen.add(unit.unitSlug);

      // first copy the exam boards onto units have no exam board (this actually
      // means they're in all exam boards).
      if (unit.examboard && unit.examboardSlug) {
        // now we restructure the exam board property
        const { examboard, examboardSlug } = unit;
        delete unit.examboard;
        delete unit.examboardSlug;

        const localExamBoards: TitleSlug[] = [
          { title: examboard, slug: examboardSlug },
        ];

        // now find if there's any other units with the same slug
        allUnits.forEach((_, j) => {
          if (i === j) {
            return false; // this is the current unit
          }
          if (_.unitSlug === unit.unitSlug) {
            if (_.examboard && _.examboardSlug) {
              localExamBoards.push({
                title: _.examboard,
                slug: _.examboardSlug,
              });
            }
          }
        });

        unit.examBoards = localExamBoards;
      } else if (!unit.examboardSlug) {
        unit.examBoards = examBoards;
      }

      acc.push(unit);

      return acc;
    }, [] as UnitWithExamBoards[]);
  }

  return units;
}

interface SlimSequenceResult {
  sequenceSlug: string;
  ks4Options?: TitleSlug[];
}

function phaseToSequences(subject: SubjectPhase): SlimSequenceResult[] {
  return subject.phases.map((phase) => {
    if (phase.slug === 'secondary' && subject.ks4_options) {
      return {
        sequenceSlug: `${subject.slug}-${phase.slug}`,
        ks4Options: subject.ks4_options,
      };
    }

    return {
      sequenceSlug: `${subject.slug}-${phase.slug}`,
    };
  });
}

async function getAllSubjects() {
  let slugFilter = '';
  if (subjectPhaseFilter) {
    const { subjectSlug } = parseSubjectPhaseSlug(subjectPhaseFilter);
    slugFilter = `slug: { _eq: "${subjectSlug}" }`;
  }

  const query = gql`
    query ($currentCycle: String!) @cached(ttl: 300) {
      ${subjectPhaseView}(
        where: {
          cycle: { _eq: $currentCycle }
          ${slugFilter}
        }
        order_by: { display_order: asc }
      ) {
        title
        slug
        keystages
        phases
        ks4_options
        display_order
      }
    }`;

  const res: SubjectPhaseView = await client.request(query, {
    currentCycle,
  });

  let reply = res[subjectPhaseView].map(phaseToSequences).flat();

  if (subjectPhaseFilter) {
    reply = reply.filter((s) => s.sequenceSlug == subjectPhaseFilter);
  }

  return reply;
}

function getUnit(sequence: UnitSchema[], unit: string) {
  const found = sequence.find((_) => _.unitSlug === unit);

  if (!found) {
    logError(`Unit not found: ${unit}`);
    process.exit(1);
  }

  return found;
}

log('Fetching all subjects...');
const startSubjects = Date.now();
const sequences: SlimSequenceResult[] = await getAllSubjects();
log(`Fetched ${sequences.length} sequences (${Date.now() - startSubjects}ms)`);

// Ensure the main output directory exists
await fs.mkdir(`${__dirname}/out`, { recursive: true });

for (const s of sequences) {
  log(`Processing sequence: ${s.sequenceSlug}`);
  const seqStart = Date.now();
  const sequence = await getAllSequenceData(s.sequenceSlug, s.ks4Options);
  log(`Fetched sequence data (${Date.now() - seqStart}ms)`);

  // Create sequence-specific directory
  const sequenceDir = `${__dirname}/out/${s.sequenceSlug}`;
  await fs.mkdir(sequenceDir, { recursive: true });

  // Create tarballs for different asset types
  const worksheetsOutput = createWriteStream(
    `${sequenceDir}/${s.sequenceSlug}-worksheets.tar`,
  );
  const worksheetsPack = tar.pack();
  worksheetsPack.pipe(worksheetsOutput);

  // Create slide decks tarball
  const slideDecksOutput = createWriteStream(
    `${sequenceDir}/${s.sequenceSlug}-slide-decks.tar`,
  );
  const slideDecksPack = tar.pack();
  slideDecksPack.pipe(slideDecksOutput);

  // Create quizzes tarball
  const quizzesOutput = createWriteStream(
    `${sequenceDir}/${s.sequenceSlug}-quizzes.tar`,
  );
  const quizzesPack = tar.pack();
  quizzesPack.pipe(quizzesOutput);

  // Create supplementary resources tarball
  const resourcesOutput = createWriteStream(
    `${sequenceDir}/${s.sequenceSlug}-resources.tar`,
  );
  const resourcesPack = tar.pack();
  resourcesPack.pipe(resourcesOutput);

  // Create asset packs object
  const assetPacks: AssetPacks = {
    // videos: videoPack,
    worksheets: worksheetsPack,
    slideDecks: slideDecksPack,
    starterQuizzes: quizzesPack,
    exitQuizzes: quizzesPack,
    supplementaryResources: resourcesPack,
  };

  await fs.writeFile(
    `${sequenceDir}/sequence.json`,
    JSON.stringify({ ...s, sequence }),
  );

  await getUnitSummaries(s.sequenceSlug, sequence, assetPacks);

  // Finalize all tarballs
  // videoPack.finalize();
  worksheetsPack.finalize();
  slideDecksPack.finalize();
  quizzesPack.finalize();
  resourcesPack.finalize();

  // this is picked up by build-bulk-download-videos.sh
  await fs.appendFile(
    `${__dirname}/videos.tsv`,
    `complete\tnop\t${s.sequenceSlug}\n`,
  );

  log(`Completed sequence: ${s.sequenceSlug}`);

  // FIXME break early
  break;
}

await db.end();
log(`Script completed`);
