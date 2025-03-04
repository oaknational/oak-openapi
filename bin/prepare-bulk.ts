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
import { SequenceSchema, Unit } from '~/lib/handlers/sequences';
import { SubjectsResult } from '~/lib/handlers/subjects';
import { promises as fs } from 'node:fs';
import lodash from 'lodash';

// get __dirname
import path from 'node:path';
import { UnitSchema } from '~/lib/handlers/units';
const __dirname = path.resolve(path.dirname(''));

let requests = 0;
const start = Date.now();

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

const deepSearchAll = (obj: any, key: string) => {
  let results: any = [];
  if (lodash.isObject(obj)) {
    if (lodash.has(obj, key)) results.push(lodash.get(obj, key));
    lodash.forOwn(obj, (value) => {
      if (lodash.isObject(value))
        results = results.concat(deepSearchAll(value, key));
    });
  }
  return results;
};

async function get(endpoint: string, emptyValue: any) {
  requests++;
  const root = 'http://localhost:2727/api/v0';
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.API_KEY}`,
  };
  console.warn(`${runtime()}/${requests}: ${endpoint}`);
  const res = await fetch(`${root}${endpoint}`, { headers });
  if (res.status !== 200) {
    console.warn(`🔴 ${res.status}: fetch ${endpoint}`);

    return emptyValue;
  }
  return await res.json();
}

async function getUnitSummaries(slug: string, sequence: SequenceSchema) {
  // walk sequence and at the lowest level, get the units array
  let unitSlugs: string[] = deepSearchAll(sequence, 'unitSlug');

  for (const unitSlug of unitSlugs) {
    const unit: UnitSchema = await get(`/units/${unitSlug}/summary`, {});

    // TODO decide whether to slim this down as it includes redundant data,
    // such as the sequence year, etc.
    await fs.appendFile(
      `${__dirname}/out/${slug}-units.jsonl`,
      JSON.stringify(unit),
    );

    const lessonSlugs = deepSearchAll(unit, 'lessonSlug');

    for (const lessonSlug of lessonSlugs) {
      const lesson = await getLessonContent(lessonSlug);
      await fs.appendFile(
        `${__dirname}/out/${slug}-lessons.jsonl`,
        JSON.stringify(lesson),
      );
    }
  }
}

async function getLessonContent(lessonSlug: string) {
  const summary = await get(`/lessons/${lessonSlug}/summary`, {});
  const transcript = await get(`/lessons/${lessonSlug}/transcript`, {});
  const quiz = await get(`/lessons/${lessonSlug}/quiz`, {});
  const assets = await get(`/lessons/${lessonSlug}/assets`, {});

  return {
    ...summary,
    transcript,
    quiz,
    assets,
  };
}

const allSubjects: SubjectsResult = await get(`/subjects`, []);
const sequences = allSubjects.map((_) => _.sequenceSlugs).flat();

for (const s of sequences) {
  const sequence = await get(`/sequences/${s.sequenceSlug}/units`, {});

  await fs.mkdir(`${__dirname}/../out/${s.sequenceSlug}`, { recursive: true });

  await fs.writeFile(
    `${__dirname}/out/${s.sequenceSlug}.json`,
    JSON.stringify({ ...s, sequence }),
  );

  getUnitSummaries(s.sequenceSlug, sequence);
  break;
}
