import { getLatestMajorVersion } from '@/lib/handlers/changelog/helpers';

let domain = `http://localhost:${process.env.PORT || 2727}`;

if (process.env.VERCEL_URL) {
  domain = `https://${process.env.VERCEL_URL}`;
}

if (process.env.VERCEL_ENV === 'production' && process.env.PRODUCTION_API_URL) {
  domain = process.env.PRODUCTION_API_URL;
}

export const baseUrl = `${domain}/api/v${getLatestMajorVersion()}`;
export const assetBaseVideoUrl =
  process.env.VIDEO_URL || 'https://stream.video.thenational.academy';
