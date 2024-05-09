import { Redis } from '@upstash/redis';

const redis = new Redis({
  // @ts-expect-error: url prop doesn't seem to be in the types, but it's definitely there
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

type Keys = string[];

export const keys: Keys = await redis.json
  .get('apikeys')
  .catch((e: Error) => {
    console.log(`Failed to collect apikeys: ${e.toString()}`);
    return []; // Add type assertion here
  })
  .then((keys) => keys as Keys);
