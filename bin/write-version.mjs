#!/usr/bin/env node
// Writes src/lib/version.ts during a release.
//
// Called by @semantic-release/exec's prepareCmd with the next version, and the
// result is committed by @semantic-release/git. Not intended to be run by hand
// — see docs/RELEASING.md.

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const version = process.argv[2];

if (!version) {
  console.error('usage: node bin/write-version.mjs <version>');
  process.exit(1);
}

if (!/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version)) {
  console.error(`refusing to write a non-semver version: ${version}`);
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const target = resolve(__dirname, '../src/lib/version.ts');

const contents = `/**
 * The project version, written during release by bin/write-version.mjs.
 *
 * Do not edit by hand — see [docs/RELEASING.md](../../docs/RELEASING.md).
 */
export const VERSION = '${version}';
`;

await writeFile(target, contents, 'utf8');

console.log(`wrote ${target} (${version})`);
