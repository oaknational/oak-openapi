import { lessonView, LessonView } from '@/lib/owaClient';
import { Storage } from '@google-cloud/storage';
import {
  isBlockedUnitOrSubject,
  isSubjectSupported,
  isUnitSupported,
} from '@/lib/queryGate';

export function isApprovedLesson(
  subjectSlug: string,
  unitSlug: string,
  lessonSlug: string,
) {
  // Return false immediately if a blocked subject
  if (isBlockedUnitOrSubject({ unitSlug, subjectSlug })) {
    return false;
  }
  // If it's a supported subject, all good
  if (isSubjectSupported(subjectSlug)) {
    return true;
  }
  // If it's a supported unit, even better - all lessons are valid
  if (isUnitSupported(unitSlug)) {
    return true;
  }
  // TODO: If all else is not true, check the lesson slug

  if (lessonSlug) return false;
}

export function getAttribution(attribution: LessonView[typeof lessonView][0]) {
  return Array.from(
    new Set(
      [
        ...(attribution.tpcWorks?.map((_) => _.attribution) || []),
        ...(attribution.tpcMedia?.map((_) => _.attribution) || []),
      ]
        .filter((string) => string !== undefined)
        .filter(Boolean),
    ),
  );
}

export async function listFilesWithMimeType(
  storage: Storage,
  bucketName: string,
  prefix: string,
) {
  // make sure to get a listing for the directory (requires trailing slash)
  if (!prefix.endsWith('/')) {
    prefix += '/';
  }

  const [files] = await storage
    .bucket(bucketName)
    .getFiles({ prefix, delimiter: '/' });

  return files.map((file) => ({
    name: file.name,
    mimeType: file.metadata.contentType || 'unknown',
  }));
}

export async function getVideoFromMux(
  sourceUrl: string,
  level: 'high' | 'medium' | 'low' = 'high',
): Promise<string> {
  const url = sourceUrl.replace(/\.m3u8$/, `/${level}.mp4`);
  const response = await fetch(url);
  if (response.status === 200) {
    return url;
  } else if (level === 'low') {
    return '';
  } else {
    const nextLevel = level === 'high' ? 'medium' : 'low';
    return getVideoFromMux(sourceUrl, nextLevel);
  }
}
