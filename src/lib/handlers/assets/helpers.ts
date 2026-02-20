import type { lessonView, LessonView } from '@/lib/owaClient';
import type { Storage } from '@google-cloud/storage';

export function getAttribution(
  attribution: LessonView[typeof lessonView][0],
): string[] {
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

interface FileWithMimeType {
  name: string;
  mimeType: string;
}

export async function listFilesWithMimeType(
  storage: Storage,
  bucketName: string,
  prefix: string,
): Promise<FileWithMimeType[]> {
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
