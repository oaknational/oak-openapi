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

import type { NextApiRequest, NextApiResponse } from 'next';

import 'renvy';
import router from '~/lib/router';
import { createCallerFactory } from '~/lib/trpc';

import { SequenceSchema } from '~/lib/handlers/sequences';
import { SubjectsResult } from '~/lib/handlers/subjects';
import { promises as fs } from 'node:fs';
import lodash from 'lodash';

// get __dirname
import path from 'node:path';
const __dirname = path.resolve(path.dirname(''));

// let requests = 0;
const start = Date.now();

const api = makeCaller();

function makeCaller() {
  const createCaller = createCallerFactory(router);
  const nop = () => {};
  const callerOptions = {
    req: {} as NextApiRequest,
    res: {
      writeHead: nop,
      setHeader: nop,
      getHeader: nop,
      pipe: nop,
      on: nop,
      once: nop,
      emit: nop,
      write: nop,
      end: nop,
    } as unknown as NextApiResponse,
    rateLimit: undefined,
    user: { key: '1', id: 1 },
  };

  return createCaller(callerOptions);
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

// async function get(endpoint: string, emptyValue: any) {
//   requests++;
//   const root = 'http://localhost:2727/api/v0';
//   const headers = {
//     'Content-Type': 'application/json',
//     Authorization: `Bearer ${process.env.API_KEY}`,
//   };
//   console.warn(`${runtime()}/${requests}: ${endpoint}`);
//   const res = await fetch(`${root}${endpoint}`, { headers });
//   if (res.status !== 200) {
//     console.warn(`🔴 ${res.status}: fetch ${endpoint}`);

//     return emptyValue;
//   }
//   return await res.json();
// }

async function getUnitSummaries(slug: string, sequence: SequenceSchema) {
  // walk sequence and at the lowest level, get the units array
  const unitSlugs: string[] = deepSearchAll(sequence, 'unitSlug');

  for (const unitSlug of unitSlugs) {
    // const unit: UnitSchema = await get(`/units/${unitSlug}/summary`, {});
    const unit = await api.getUnits.getUnit({ unit: unitSlug });

    // TODO decide whether to slim this down as it includes redundant data,
    // such as the sequence year, etc.
    await fs.appendFile(
      `${__dirname}/out/${slug}-units.jsonl`,
      JSON.stringify(unit),
    );

    const lessonSlugs = deepSearchAll(
      unit,
      'lessonSlug',
      (_: { state: string }) => {
        return _.state === 'published';
      },
    );

    for (const lessonSlug of lessonSlugs) {
      try {
        const lesson = await getLessonContent(lessonSlug);
        await fs.appendFile(
          `${__dirname}/out/${slug}-lessons.jsonl`,
          JSON.stringify(lesson),
        );
        console.log(`🟢 ${lessonSlug}`);
      } catch (_) {}
    }
  }
}

async function getLessonContent(lesson: string) {
  // if this throws, then we ignore this lesson
  const summary = await api.getLessons.getLesson({ lesson });

  const transcript = await api.getLessonTranscript
    .getLessonTranscript({
      lesson,
    })
    .catch(() => null);
  const quiz = await api.getQuestions.getQuestionsForLessons({ lesson });
  const assets = await api.getAssets
    .getLessonAssets({ lesson })
    .catch(() => []);

  return {
    ...summary,
    transcript,
    quiz,
    assets,
  };
}

const allSubjects: SubjectsResult = await api.getSubjects.getAllSubjects();
const sequences = allSubjects.map((_) => _.sequenceSlugs).flat();

for (const s of sequences) {
  const sequence = await api.getSequences.getSequenceUnits({
    sequence: s.sequenceSlug,
  });

  await fs.mkdir(`${__dirname}/../out/${s.sequenceSlug}`, { recursive: true });

  await fs.writeFile(
    `${__dirname}/out/${s.sequenceSlug}.json`,
    JSON.stringify({ ...s, sequence }),
  );

  await getUnitSummaries(s.sequenceSlug, sequence as unknown as SequenceSchema);
  break;
}

console.log(runtime());
