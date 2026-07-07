import 'renvy';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { getClient, gql, lessonView } from '@/lib/owaClient';
import type { LessonView } from '@/lib/owaClient';
import {
  blockLessonForCopyrightText,
  checkLessonAllowedAsset,
  checkLessonAllowedQuiz,
} from '@/lib/queryGate';

// ─── Configuration ──────────────────────────────────────────────────────────
// Change these to control which lessons are sourced for the test.

const SUBJECT = 'maths';
const KEY_STAGES: string[] = []; // e.g. ['ks1', 'ks2'] — empty = all
const BATCH_SIZE = 500;

// Get optional file name from command line arguments
const inputFile = process.argv[2];

// ─────────────────────────────────────────────────────────────────────────────

interface LessonRow {
  lessonSlug: string;
  unitSlug: string;
  subjectSlug: string;
}

function loadLessonSlugsFromFile(filePath: string): string[] {
  const content = readFileSync(resolve(filePath), 'utf-8');
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

async function fetchLessonSlugs(): Promise<LessonRow[]> {
  const client = getClient();
  const lessons: LessonRow[] = [];
  let offset = 0;

  const hasKsFilter = KEY_STAGES.length > 0;

  const query = gql`
    query ($subject: String!, $limit: Int!, $offset: Int!${hasKsFilter ? ', $keyStages: [String!]!' : ''}) {
      ${lessonView}(
        where: {
          subjectSlug: { _eq: $subject }
          isLegacy: { _eq: false }
          ${hasKsFilter ? 'keyStageSlug: { _in: $keyStages }' : ''}
        }
        distinct_on: lessonSlug
        limit: $limit
        offset: $offset
      ) {
        lessonSlug
        unitSlug
        subjectSlug
      }
    }
  `;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const variables: Record<string, unknown> = {
      subject: SUBJECT,
      limit: BATCH_SIZE,
      offset,
    };
    if (hasKsFilter) {
      variables.keyStages = KEY_STAGES;
    }

    const res: LessonView = await client.request(query, variables);
    const batch = res[lessonView] as unknown as LessonRow[];

    if (batch.length === 0) break;

    lessons.push(...batch);
    offset += BATCH_SIZE;

    if (batch.length < BATCH_SIZE) break;
  }

  return lessons;
}

async function fetchLessonDetailsFromSlugs(
  slugs: string[],
): Promise<LessonRow[]> {
  const client = getClient();
  const lessons: LessonRow[] = [];

  const query = gql`
    query ($lessonSlugs: [String!]!) {
      ${lessonView}(
        where: {
          lessonSlug: { _in: $lessonSlugs }
        }
        distinct_on: lessonSlug
      ) {
        lessonSlug
        unitSlug
        subjectSlug
      }
    }
  `;

  // Process in batches to avoid query size limits
  for (let i = 0; i < slugs.length; i += BATCH_SIZE) {
    const batch = slugs.slice(i, i + BATCH_SIZE);
    const res: LessonView = await client.request(query, {
      lessonSlugs: batch,
    });
    const results = res[lessonView] as unknown as LessonRow[];
    lessons.push(...results);
  }

  return lessons;
}

interface GateResult {
  lessonSlug: string;
  copyrightBlocked: boolean;
  copyrightReason: string;
  assetBlocked: boolean;
  assetReason: string;
  quizBlocked: boolean;
  quizReason: string;
}

async function runGateChecks(lessons: LessonRow[]): Promise<GateResult[]> {
  const client = getClient();
  const results: GateResult[] = [];

  for (const { lessonSlug } of lessons) {
    const copyright = await blockLessonForCopyrightText(client, lessonSlug);
    const asset = await checkLessonAllowedAsset({
      lessonSlug,
      client,
    });
    const quiz = await checkLessonAllowedQuiz(client, lessonSlug);

    results.push({
      lessonSlug,
      copyrightBlocked: copyright.isBlocked(),
      copyrightReason: copyright.reason,
      assetBlocked: asset.isBlocked(),
      assetReason: asset.reason,
      quizBlocked: quiz.isBlocked(),
      quizReason: quiz.reason,
    });
  }

  return results;
}

async function main() {
  let lessons: LessonRow[];

  if (inputFile) {
    console.log(`Reading lesson slugs from: ${inputFile}`);
    const slugs = loadLessonSlugsFromFile(inputFile);
    console.log(`Loaded ${slugs.length} lesson slugs\n`);

    if (slugs.length === 0) {
      console.log('No lesson slugs found in file.');
      return;
    }

    console.log('Fetching unit and subject slugs from GraphQL...\n');
    lessons = await fetchLessonDetailsFromSlugs(slugs);
  } else {
    const filterDesc = KEY_STAGES.length
      ? `subject=${SUBJECT}, keyStages=${KEY_STAGES.join(',')}`
      : `subject=${SUBJECT} (all key stages)`;

    console.log(`Fetching lessons for: ${filterDesc}`);
    lessons = await fetchLessonSlugs();
    console.log(`Found ${lessons.length} unique lessons\n`);

    if (lessons.length === 0) {
      console.log('No lessons found. Check the configuration.');
      return;
    }
  }

  console.log('Running gate checks...\n');
  const results = await runGateChecks(lessons);

  const copyrightBlocked = results.filter((r) => r.copyrightBlocked);
  const assetBlocked = results.filter((r) => r.assetBlocked);
  const quizBlocked = results.filter((r) => r.quizBlocked);
  const allClear = results.filter(
    (r) => !r.copyrightBlocked && !r.assetBlocked && !r.quizBlocked,
  );

  console.log('=== Summary ===');
  console.log(`Total lessons:       ${results.length}`);
  console.log(`Copyright blocked:   ${copyrightBlocked.length}`);
  console.log(`Asset blocked:       ${assetBlocked.length}`);
  console.log(`Quiz blocked:        ${quizBlocked.length}`);
  console.log(`All clear:           ${allClear.length}`);

  // if (copyrightBlocked.length > 0) {
  //   console.log('\n--- Copyright blocked lessons ---');
  //   for (const r of copyrightBlocked) {
  //     console.log(`  ${r.lessonSlug} — ${r.copyrightReason}`);
  //   }
  // }

  // if (assetBlocked.length > 0) {
  //   console.log('\n--- Asset blocked lessons ---');
  //   for (const r of assetBlocked) {
  //     console.log(`  ${r.lessonSlug} — ${r.assetReason}`);
  //   }
  // }

  // if (quizBlocked.length > 0) {
  //   console.log('\n--- Quiz blocked lessons ---');
  //   for (const r of quizBlocked) {
  //     console.log(`  ${r.lessonSlug} — ${r.quizReason}`);
  //   }
  // }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
