// 1. loop through all the subjects and phases - what do about exam boards
// 2. for each sequence, download `/sequences/{subject}-{phase}/units`
// 3. for each unit, download `/units/{unit}/summary`
// 4. for each lesson in the unit, download `/lessons/{lesson}/summary`
// 5. for each lesson, also download `/lessons/{lesson}/content`
// 6. for each lesson, also download the questions `/lessons/{lesson}/quiz`
// 6. for each lesson, also download the transcript `/lessons/{lesson}/transcript`

/**
 * finish with a data structure like this:
 * {
 *   "subject": "string",
 *   "phase": "string",
 *   "units": [
 *     {
 *       "summary": "string"
 *     }
 *   ],
 *   "lessons": {
 *     "slug": {}
 *   }
 * }
 */

import 'renvy';
import path from 'node:path';
import { promises as fs, createWriteStream } from 'node:fs';
import pg from 'pg';
import lodash from 'lodash';
import tar from 'tar-stream';
import { gql } from 'graphql-request';
import { sequenceWhere } from '~/lib/handlers/sequences';
import {
  phaseToKeyStages,
  phaseToSequences,
  SubjectsResult,
  yearsFromKeyStages,
} from '~/lib/handlers/subjects';
import {
  currentCycle,
  DownloadView,
  downloadView,
  getClient,
  SequenceView,
  sequenceView,
  sequenceViewWhereInput,
  subjectPhaseView,
  SubjectPhaseView,
} from '~/lib/owaClient';
import { formatUnitSummary, UnitSchema } from '~/lib/handlers/units';
import { getVideoFromMux } from '~/lib/handlers/assets';
import { Readable } from 'stream';

const __dirname = path.resolve(path.dirname(''));

// let requests = 0;
const start = Date.now();
const client = getClient();

const db = new pg.Client(process.env.DATABASE_URL);
await db.connect();

interface Pack {
  entry: (header: tar.Headers) => NodeJS.WritableStream;
}

async function addVideoToTar(
  pack: Pack,
  url: string,
  filename: string,
): Promise<void> {
  const response = await fetch(url);
  if (!response.body) throw new Error(`Failed to fetch ${url}`);

  const nodeStream = Readable.fromWeb(response.body);

  return new Promise<void>((resolve, reject) => {
    const entry = pack.entry({ name: filename }, (err) => {
      if (err) reject(err);
      else resolve();
    });

    nodeStream.pipe(entry);
    nodeStream.on('end', () => entry.end());
    nodeStream.on('error', reject);
  });
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
  pack: Pack,
) {
  // walk sequence and at the lowest level, get the units array
  const unitSlugs: string[] = deepSearchAll(sequence, 'unitSlug');

  for (const unitSlug of unitSlugs) {
    // const unit: UnitSchema = await get(`/units/${unitSlug}/summary`, {});
    const unit = getUnit(sequence, unitSlug);

    if (!unit) {
      console.log(`🔴 ${unitSlug}`);
      continue;
    }
    console.log(`🟢 ${unitSlug}`);

    // TODO decide whether to slim this down as it includes redundant data,
    // such as the sequence year, etc.
    await fs.appendFile(
      `${__dirname}/out/${slug}-units.jsonl`,
      JSON.stringify(unit),
    );

    const lessonData = await getAllLessonData(unitSlug);
    const videoLinks = await getAllLessonAssets(
      lessonData.map((_) => _.lessonSlug),
    );

    for (const lesson of lessonData) {
      try {
        // TODO pack in the video
        const url = await getVideoFromMux(videoLinks[lesson.lessonSlug]);
        console.log(`🔵 ${url}`);
        await addVideoToTar(pack, url, `${lesson.lessonSlug}.mp4`);

        console.log(`📹 ${lesson.lessonSlug}`);

        // delete the url from the lesson object

        await fs.appendFile(
          `${__dirname}/out/${slug}-lessons.jsonl`,
          JSON.stringify(lesson),
        );

        console.log(`🟢 ${lesson.lessonSlug}`);
      } catch (_) {}
    }
  }
}

export async function getAllLessonAssets(
  lessonSlugs: string[],
): Promise<Record<string, string>> {
  const query = gql`
      query GetDownloads($slugs: [String!]!) {
        ${downloadView}(
          where: {
            lessonSlug: { _in: $slugs }
          }
        ) {
          lessonSlug
          video: videos
        }
      }
    `;

  const variables = {
    slugs: lessonSlugs,
  };

  const res: DownloadView = await client.request(query, variables);

  // map res so that it's slug -> video
  const map = res[downloadView].reduce(
    (acc, { lessonSlug, video }) => {
      acc[lessonSlug] = video.stream;
      return acc;
    },
    {} as Record<string, string>,
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

async function getAllSequenceData(sequence: string): Promise<UnitSchema[]> {
  const where = sequenceWhere(sequence);
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
  return res[sequenceView].map((_) => formatUnitSummary(_.slug, _));
}

async function getAllSubjects() {
  const query = gql`
        query ($currentCycle: String!) @cached(ttl: 300) {
          ${subjectPhaseView}(
            where: {
              cycle: { _eq: $currentCycle }
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

  const reply = res[subjectPhaseView].map((subject) => {
    const keyStages = phaseToKeyStages(subject);
    return {
      subjectTitle: subject.title,
      subjectSlug: subject.slug,
      sequenceSlugs: phaseToSequences(subject),
      keyStages,
      years: yearsFromKeyStages(keyStages),
    };
  });

  return reply;
}

function getUnit(sequence: UnitSchema[], unit: string) {
  const found = sequence.find((_) => _.unitSlug === unit);

  if (!found) {
    console.log('not found', unit);
    process.exit(1);
  }

  return found;
}

const allSubjects: SubjectsResult = await getAllSubjects();
const sequences = allSubjects.map((_) => _.sequenceSlugs).flat();

for (const s of sequences) {
  const sequence = await getAllSequenceData(s.sequenceSlug);

  await fs.mkdir(`${__dirname}/../out/${s.sequenceSlug}`, { recursive: true });

  const output = createWriteStream(
    `${__dirname}/out/${s.sequenceSlug}-videos.tar`,
  );
  const pack = tar.pack();

  pack.pipe(output);

  await fs.writeFile(
    `${__dirname}/out/${s.sequenceSlug}.json`,
    JSON.stringify({ ...s, sequence }),
  );

  await getUnitSummaries(s.sequenceSlug, sequence, pack);
  pack.finalize();

  // FIXME break early
  break;
}

console.log(runtime());

await db.end();
