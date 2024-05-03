import { Redis } from '@upstash/redis';

const redis = new Redis({
  // @ts-ignore: url prop doesn't seem to be in the types, but it's definitely there
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const keys = await redis.json.get('apikeys').catch((e) => {
  console.log(`Failed to collect apikeys: ${e.toString()}`);
});
