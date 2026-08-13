/**
 * An in-memory stand-in for the Upstash Redis client, covering only the
 * commands `src/lib/apikeys.ts` uses.
 *
 * The real client stores everything as strings server-side and JSON-parses on
 * read, so numbers come back as numbers and nulls as nulls. The fake does the
 * same round-trip rather than handing back the original object, because that
 * coercion is exactly where the user record has caused trouble before.
 */

type Hash = Record<string, string>;
type Stored = string | Hash;

const store = new Map<string, Stored>();

function serialise(value: unknown): string {
  return typeof value === 'string' ? value : JSON.stringify(value);
}

function deserialise(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function readHash(key: string): Hash {
  const value = store.get(key);
  if (value === undefined) {
    return {};
  }
  if (typeof value === 'string') {
    throw new Error(`WRONGTYPE: ${key} holds a string, not a hash`);
  }
  return value;
}

function globToRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped.replace(/\*/g, '.*').replace(/\?/g, '.')}$`);
}

interface PipelineCommand {
  run: () => unknown;
}

export const fakeRedis = {
  reset(): void {
    store.clear();
  },

  /** Test helper: the raw serialised hash, for asserting on what was written. */
  dump(key: string): Hash | string | undefined {
    return store.get(key);
  },

  async exists(...keys: string[]): Promise<number> {
    return keys.filter((key) => store.has(key)).length;
  },

  async hgetall(key: string): Promise<Record<string, unknown> | null> {
    const hash = store.get(key);
    if (hash === undefined || typeof hash === 'string') {
      return null;
    }
    const result: Record<string, unknown> = {};
    for (const [field, value] of Object.entries(hash)) {
      result[field] = deserialise(value);
    }
    return Object.keys(result).length === 0 ? null : result;
  },

  async hset(key: string, values: Record<string, unknown>): Promise<number> {
    const hash = readHash(key);
    let added = 0;
    for (const [field, value] of Object.entries(values)) {
      if (!(field in hash)) {
        added += 1;
      }
      hash[field] = serialise(value);
    }
    store.set(key, hash);
    return added;
  },

  async hincrby(key: string, field: string, by: number): Promise<number> {
    const hash = readHash(key);
    const next = Number(deserialise(hash[field] ?? '0')) + by;
    hash[field] = serialise(next);
    store.set(key, hash);
    return next;
  },

  async get(key: string): Promise<unknown> {
    const value = store.get(key);
    return value === undefined || typeof value !== 'string'
      ? null
      : deserialise(value);
  },

  async set(key: string, value: unknown): Promise<string> {
    store.set(key, serialise(value));
    return 'OK';
  },

  async del(...keys: string[]): Promise<number> {
    return keys.filter((key) => store.delete(key)).length;
  },

  async incr(key: string): Promise<number> {
    const next = Number(await fakeRedis.get(key)) + 1;
    store.set(key, serialise(next));
    return next;
  },

  async keys(pattern: string): Promise<string[]> {
    const match = globToRegExp(pattern);
    return [...store.keys()].filter((key) => match.test(key));
  },

  pipeline() {
    const queue: PipelineCommand[] = [];
    const chain = {
      hgetall(key: string) {
        queue.push({ run: () => fakeRedis.hgetall(key) });
        return chain;
      },
      hset(key: string, values: Record<string, unknown>) {
        queue.push({ run: () => fakeRedis.hset(key, values) });
        return chain;
      },
      hincrby(key: string, field: string, by: number) {
        queue.push({ run: () => fakeRedis.hincrby(key, field, by) });
        return chain;
      },
      async exec<T>(): Promise<T> {
        const results = [];
        for (const command of queue) {
          results.push(await command.run());
        }
        return results as T;
      },
    };
    return chain;
  },
};
