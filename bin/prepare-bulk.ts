// See README_BULK_DOWNLOAD.md for details
import fs from 'node:fs/promises';
import 'renvy';
import { getClient } from '@/lib/owaClient';

import { getVideoFromMux } from '@/lib/handlers/assets/helpers';
import {
  isLessonSupported,
  isSubjectSupported,
  isUnitSupported,
} from '@/lib/queryGate';
import assert from 'node:assert';
import { log, logError } from '../src/lib/bulk-data/logger';
import {
  deepSearchAll,
  waitForEnter,
  __dirname,
} from '../src/lib/bulk-data/utils';
import {
  getGoogleCloudStorage,
  uploadToStorage,
} from '../src/lib/bulk-data/data-stores';
import { AssetPacks, UnitWithExamBoards } from '../src/lib/bulk-data/types';
import {
  addStorageAssetToTar,
  addURLToQueue,
  buildAssetPacks,
  downloadQuiz,
} from '../src/lib/bulk-data/assets';
import {
  getAllLessonAssets,
  getAllLessonData,
  getAllSequenceData,
  getAllSubjects,
  getUnit,
} from '../src/lib/bulk-data/get-data';

const processAssets = process.env.INCLUDE_ASSETS ? true : false;

if (processAssets && process.version < 'v22') {
  // this is because node 18 leaves sockets open 😱
  console.error('Node version 22 or higher is required');
  process.exit(1);
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

if (processAssets) {
  console.log('Also remember to start ./bulk-download-videos.sh. Ready?');
  await waitForEnter();
}

const client = getClient();
const storage = getGoogleCloudStorage();

const memoryTracker = trackMemoryUsage();

main().finally(() => {
  clearInterval(memoryTracker);
});

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

async function buildLessonData(
  slug: string,
  sequence: UnitWithExamBoards[],
  packs: AssetPacks,
) {
  // Ensure the sequence directory exists
  const sequenceDir = `${__dirname}/out/${slug}`;
  await fs.mkdir(sequenceDir, { recursive: true });

  // walk sequence and at the lowest level, get the units array
  const unitSlugs: string[] = deepSearchAll(sequence, 'unitSlug');

  const totalLessonCount = sequence.reduce((acc, _) => {
    const lessons = _.unitLessons.filter((l) => l.state === 'published').length;
    return acc + lessons;
  }, 0);

  let currentLessonCtr = 0;

  const lessons = [];

  for (const unitSlug of unitSlugs) {
    const unit = getUnit(sequence, unitSlug);

    if (!unit) {
      logError(`Unit not found: ${unitSlug}`);
      continue;
    }

    const lessonData = await getAllLessonData(unitSlug);
    // log(`Processing unit: ${unitSlug} with ${lessonData.length} lessons`);

    if (!processAssets) {
      lessons.push(...lessonData);
      /**
       * The default usage, this is the point where the loop ends
       * because we're not collecting assets by default.
       */
      continue;
    }

    const assetLinks = await getAllLessonAssets(
      client,
      lessonData.map((_) => _.lessonSlug),
    );

    for (const lesson of lessonData) {
      // Check if this lesson's assets are allowed based on subject/unit gating
      const assetsAllowed = isLessonAssetsAllowed(lesson);

      log(`${++currentLessonCtr}/${totalLessonCount}: ${lesson.lessonSlug}`);

      if (lesson.transcript_sentences) {
        lesson.transcript_sentences = lesson.transcript_sentences.replace(
          /<[^>]*>/g,
          '',
        );
      }

      if (processAssets) {
        if (!assetsAllowed) {
          log(
            `Skipping lesson ${lesson.lessonSlug} assets - not in allowed subjects/units list`,
          );
        } else {
          // Process video
          try {
            const url = await getVideoFromMux(
              assetLinks[lesson.lessonSlug].videoStream as unknown as string,
            );

            await addURLToQueue(url, `${lesson.lessonSlug}.mp4`, slug);
            lesson.video = `${slug}-videos.tar:${lesson.lessonSlug}.mp4`;
          } catch (e) {
            logError(`Failed to process video for ${lesson.lessonSlug}: ${e}`);
          }

          // Process slide deck if available and has bucket_name - replace extension with PPTX
          if (
            assetLinks[lesson.lessonSlug].slideDeck &&
            assetLinks[lesson.lessonSlug].slideDeck.bucket_name &&
            packs.slideDecks
          ) {
            try {
              const slideDeck = assetLinks[lesson.lessonSlug].slideDeck;

              // Make a copy of the slideDeck object with modified bucket_path
              const modifiedSlideDeck = { ...slideDeck };

              // Replace the extension in the bucket_path with PPTX
              const parts = modifiedSlideDeck.bucket_path.split('/');
              parts.pop(); // drop the filename
              modifiedSlideDeck.bucket_path =
                parts.join('/') + '/PowerPoint.pptx';

              await addStorageAssetToTar(
                packs.slideDecks,
                modifiedSlideDeck,
                `${lesson.lessonSlug}_slide_deck.pptx`,
                storage,
              );

              lesson.slideDeck = `${slug}-slide-decks.tar:${lesson.lessonSlug}_slide_deck.pptx`;
            } catch (e) {
              logError(
                `Failed to process slide deck for ${lesson.lessonSlug}: ${e}`,
              );
              logError(
                `Slide deck data: ${JSON.stringify(assetLinks[lesson.lessonSlug].slideDeck)}`,
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
                storage,
              );

              lesson.supplementaryResource = `${slug}-resources.tar:${lesson.lessonSlug}_supplementary.pdf`;

              // log(`Supplementary resource processed: ${lesson.lessonSlug}`);
            } catch (e) {
              logError(
                `Failed to process supplementary resource for ${lesson.lessonSlug}: ${e}`,
              );
              logError(
                `Supplementary resource data: ${JSON.stringify(assetLinks[lesson.lessonSlug].supplementaryResource)}`,
              );
            }
          }

          // now do quizzes (and worksheet) and their respective answer sheets
          for (const key of ['starterQuiz', 'exitQuiz', 'worksheet'] as const) {
            await downloadQuiz(key, assetLinks, lesson, packs, slug, storage);
          }
        }
      }

      try {
        await fs.appendFile(
          `${sequenceDir}/lessons.jsonl`,
          JSON.stringify(lesson) + '\n',
        );
      } catch (error) {
        logError(`Failed processing lesson ${lesson.lessonSlug}: ${error}`);
      }
    }
  }

  // note that the number of processed lessons can be more than the total found
  // this is because the units are unique in sequence, but in doing so, some
  // units (with the same slug) have different lessons across different exam boards
  // for instance "representation-of-text-images-and-sound" has 7 lessons in AQA,
  // but 8 lessons in OCR.
  assert(
    lessons.length >= totalLessonCount,
    `Failed lesson count: ${slug} ${lessons.length}/${totalLessonCount}`,
  );

  log(`Completed ${slug} total: ${totalLessonCount} lessons`);

  return lessons;
}

async function main() {
  const startSubjects = Date.now();
  const sequences = await getAllSubjects(client, subjectPhaseFilter);
  log(
    `Fetched ${sequences.length} subject phase/s (${Date.now() - startSubjects}ms)`,
  );

  // Ensure the main output directory exists
  await fs.mkdir(`${__dirname}/out`, { recursive: true });

  for (const s of sequences) {
    log(`Processing subject phase: ${s.sequenceSlug}`);

    const sequence = await getAllSequenceData(
      client,
      s.sequenceSlug,
      s.ks4Options,
    );

    if (sequence.length === 0) {
      continue;
    }

    // create sequence-specific directory
    const sequenceDir = `${__dirname}/out/${s.sequenceSlug}`;

    // if the directory already exists, assume it's already been
    // processed and skip it
    if (await fs.stat(sequenceDir).catch(() => false)) {
      log(`Skipping sequence ${s.sequenceSlug} - already processed`);

      uploadToStorage(sequenceDir, s.sequenceSlug, storage);
      continue;
    }

    try {
      await fs.mkdir(sequenceDir, { recursive: true });

      const assetPacks: AssetPacks = {};

      if (processAssets) {
        buildAssetPacks(sequenceDir, s.sequenceSlug, assetPacks);
      }

      const lessons = await buildLessonData(
        s.sequenceSlug,
        sequence,
        assetPacks,
      );

      await fs.writeFile(
        `${sequenceDir}/${s.sequenceSlug}.json`,
        JSON.stringify({ ...s, sequence, lessons }),
      );

      // send to google storage
      if (lessons.length) {
        uploadToStorage(sequenceDir, s.sequenceSlug, storage);
      }

      if (processAssets) {
        // finalize all tarballs
        if (assetPacks.worksheets) assetPacks.worksheets.finalize();
        if (assetPacks.slideDecks) assetPacks.slideDecks.finalize();
        if (assetPacks.starterQuizzes) assetPacks.starterQuizzes.finalize();
        if (assetPacks.supplementaryResources)
          assetPacks.supplementaryResources.finalize();

        // this is picked up by build-bulk-download-videos.sh
        await fs.appendFile(
          `${__dirname}/videos.tsv`,
          `complete\tnop\t${s.sequenceSlug}\n`,
        );
      }

      log(`Completed subject phase: ${s.sequenceSlug}`);
    } catch (e) {
      const error = e as Error;

      if (error.name === 'AssertionError') {
        logError(`${error.message}`);
      } else {
        logError(`Failed to process ${s.sequenceSlug}: ${e}`);
        if (error.stack) logError(error.stack);
      }
      await fs.rmdir(`${sequenceDir}`);
    }
  }

  // await db.end();
  log(`Script completed`);
}

export function trackMemoryUsage() {
  type MemoryUsageKeys = keyof NodeJS.MemoryUsage;

  const maxUsage: Record<MemoryUsageKeys, number> = {
    rss: 0,
    heapTotal: 0,
    heapUsed: 0,
    external: 0,
    arrayBuffers: 0,
  };

  return setInterval(() => {
    const usage = process.memoryUsage();

    for (const key in usage) {
      const k = key as MemoryUsageKeys;
      if (usage[k] > maxUsage[k]) {
        maxUsage[k] = usage[k];
      }
    }

    const toMB = (bytes: number) => Math.round(bytes / 1024 / 1024);

    console.warn(`Current Usage:
    RSS: ${toMB(usage.rss)} MB (max ${toMB(maxUsage.rss)} MB)
    Heap Total: ${toMB(usage.heapTotal)} MB (max ${toMB(maxUsage.heapTotal)} MB)
    Heap Used: ${toMB(usage.heapUsed)} MB (max ${toMB(maxUsage.heapUsed)} MB)
    External: ${toMB(usage.external)} MB (max ${toMB(maxUsage.external)} MB)
    Array Buffers: ${toMB(usage.arrayBuffers)} MB (max ${toMB(maxUsage.arrayBuffers)} MB)`);
  }, 5000);
}
