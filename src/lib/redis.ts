import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'http://dummy:1234',
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
