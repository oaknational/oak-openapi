import 'renvy';
import { getLatestMajorVersion } from '../src/lib/handlers/changelog';
import { SubjectsResult } from '~/lib/handlers/subjects';
import { promises as fs } from 'node:fs';
import type { SourceRecord } from '~/lib/keyStageAndSubjects';

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));

const port = process.env.PORT || '2727';

if (!port) {
  throw new Error('PORT env is not defined - required to complete the build');
}

const key = process.env.API_KEY;

if (!key) {
  throw new Error(
    'API_KEY env is not defined - required to complete the build',
  );
}

const version = getLatestMajorVersion();
const res = await fetch(`http://localhost:${port}/api/v${version}/subjects`, {
  headers: {
    Authorization: `Bearer ${key}`,
  },
});

let data: SubjectsResult;

try {
  data = await res.json();
} catch (e) {
  console.log(
    'Failed to fetch data from the API, please ensure the API is running and the API_KEY is correct',
  );
  process.exit(1);
}

// map(.keyStages | map({ slug: .keyStageSlug, title: .keyStageTitle })) | flatten | unique

const result: SourceRecord[] = data
  .flatMap((item) =>
    item.keyStages.map(({ keyStageSlug: slug, keyStageTitle: title }) => ({
      slug,
      title,
      subjects: [],
    })),
  )
  .filter(
    (v, i, arr) =>
      arr.findIndex((o) => o.slug === v.slug && o.title === v.title) === i,
  );

// for each keystage, find the subjects that are taught at that key stage
for (const { slug } of result) {
  const subjects = data
    .filter((item) => item.keyStages.some((ks) => ks.keyStageSlug === slug))
    .map((item) => ({ slug: item.subjectSlug, title: item.subjectTitle }))
    .sort((a, b) => a.title.localeCompare(b.slug));

  // add the subjects to the key stage
  result.find((v) => v.slug === slug)!.subjects = subjects;
}

fs.writeFile(
  resolve(__dirname, '..', 'src', 'lib', 'keyStageAndSubjects.json'),
  JSON.stringify(result, null, 2),
);
