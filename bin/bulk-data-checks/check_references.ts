import { existsSync } from 'fs';
import { readJsonAsync, expandGlobPatterns } from './lib.js';

interface Unit {
  unitSlug: string;
  unitTitle?: string;
  unitLessons?: UnitLesson[];
}

interface UnitLesson {
  lessonSlug: string;
  lessonTitle?: string;
  state?: string;
}

interface Lesson {
  lessonSlug: string;
  lessonTitle?: string;
  unitSlug: string;
  unitTitle?: string;
}

interface SubjectData {
  sequence?: Unit[];
  lessons?: Lesson[];
}

async function loadJson(path: string): Promise<SubjectData> {
  return (await readJsonAsync(path)) as SubjectData;
}

async function checkFile(path: string): Promise<number> {
  const data = await loadJson(path);
  let errors = 0;
  let warnings = 0;

  const sequence = data.sequence || [];
  const lessons = data.lessons || [];

  const unitSlugToTitle = new Map<string, string | undefined>();
  for (const u of sequence) {
    unitSlugToTitle.set(u.unitSlug, u.unitTitle);
  }
  const unitSlugs = new Set(unitSlugToTitle.keys());

  const lessonSlugToLesson = new Map<string, Lesson>();
  for (const l of lessons) {
    lessonSlugToLesson.set(l.lessonSlug, l);
  }
  const lessonSlugs = new Set(lessonSlugToLesson.keys());

  // Check unitLessons references -> lessons
  for (const unit of sequence) {
    const unitSlug = unit.unitSlug;
    const unitLessons = unit.unitLessons || [];
    for (const entry of unitLessons) {
      const lessonSlug = entry.lessonSlug;
      const state = entry.state;
      // Only published lessons are expected in the lessons array.
      if (state !== 'published') {
        continue;
      }
      if (!lessonSlugs.has(lessonSlug)) {
        errors++;
        console.error(
          `[ERROR] ${path}: unit ${unitSlug} references missing lessonSlug ${lessonSlug}`,
        );
        continue;
      }

      // Optional title consistency check
      const lesson = lessonSlugToLesson.get(lessonSlug);
      if (!lesson) continue;
      const entryTitle = entry.lessonTitle;
      const lessonTitle = lesson.lessonTitle;
      if (entryTitle && lessonTitle && entryTitle !== lessonTitle) {
        warnings++;
        console.error(
          `[WARN] ${path}: lessonSlug ${lessonSlug} title mismatch ` +
            `(unitLessons '${entryTitle}' vs lessons '${lessonTitle}')`,
        );
      }
    }
  }

  // Check lessons -> unitSlug
  for (const lesson of lessons) {
    const lessonSlug = lesson.lessonSlug;
    const unitSlug = lesson.unitSlug;
    if (!unitSlugs.has(unitSlug)) {
      errors++;
      console.error(
        `[ERROR] ${path}: lesson ${lessonSlug} references missing unitSlug ${unitSlug}`,
      );
      continue;
    }

    // Optional unit title consistency check
    const lessonUnitTitle = lesson.unitTitle;
    const unitTitle = unitSlugToTitle.get(unitSlug);
    if (lessonUnitTitle && unitTitle && lessonUnitTitle !== unitTitle) {
      warnings++;
      console.error(
        `[WARN] ${path}: unitSlug ${unitSlug} title mismatch ` +
          `(lessons '${lessonUnitTitle}' vs sequence '${unitTitle}')`,
      );
    }
  }

  // Summary
  console.log(`${path}: ${errors} error(s), ${warnings} warning(s)`);

  return errors ? 1 : 0;
}

export async function checkReferences(patterns: string[]): Promise<number> {
  if (patterns.length === 0) {
    console.error('[ERROR] No files provided. Pass files or glob patterns.');
    return 2;
  }

  const files = await expandGlobPatterns(patterns);

  let exitCode = 0;

  for (const filePath of files) {
    if (!existsSync(filePath)) {
      console.error(`[ERROR] Missing file: ${filePath}`);
      exitCode = 1;
      continue;
    }
    const result = await checkFile(filePath);
    exitCode = Math.max(exitCode, result);
  }

  return exitCode;
}

async function main(): Promise<number> {
  const args = process.argv.slice(2);
  return checkReferences(args);
}

// Only run main if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then((exitCode) => process.exit(exitCode))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
