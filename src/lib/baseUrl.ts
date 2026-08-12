import { API_MAJOR } from '@/lib/apiVersion';

let origin = `http://localhost:${process.env.PORT || 2727}`;

if (process.env.NODE_ENV === 'production' && process.env.VERCEL_BRANCH_URL) {
  origin = `https://${process.env.VERCEL_BRANCH_URL}`;
} else if (process.env.VERCEL_URL) {
  origin = `https://${process.env.VERCEL_URL}`;
}

if (process.env.VERCEL_ENV === 'production' && process.env.PRODUCTION_API_URL) {
  origin = process.env.PRODUCTION_API_URL;
}

export const baseUrl = `${origin}/api/${API_MAJOR}`;
export const assetBaseVideoUrl =
  process.env.VIDEO_URL || 'https://stream.video.thenational.academy';
