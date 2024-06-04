import { Redis } from '@upstash/redis';

const redis = new Redis({
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
