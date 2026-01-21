// yipes, this is a long list, but it's fine and it's _only_ for this file
// due to the nature of deep searching arbitrary objects in deepSearchAll
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import lodash from 'lodash';
import readline from 'node:readline';
import path from 'node:path';

export const __dirname = path.resolve(path.dirname(''));

export function deepSearchAll(
  obj: any,
  key: string,
  cond?: (_?: any) => boolean,
): any {
  let results: any = [];
  if (lodash.isObject(obj)) {
    if (lodash.has(obj, key)) {
      if (!cond || cond(obj)) {
        results.push(lodash.get(obj, key));
      }
    }
    lodash.forOwn(obj, (value) => {
      if (lodash.isObject(value)) {
        results = results.concat(deepSearchAll(value, key, cond));
      }
    });
  }
  return results;
}

// Function to wait for user input
export async function waitForEnter(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('Press Enter to continue...', () => {
      rl.close();
      resolve();
    });
  });
}

export function tuplesToObjects<K extends string, V>(
  data: [K[], ...V[][]],
): Record<K, V>[] {
  const [keys, ...rows] = data;
  return rows.map((row) => {
    return Object.fromEntries(
      keys
        .map((k, i) => {
          // true/false is mapped like this
          if (row[i] === 't' || row[i] === 'f') {
            return [k, row[i] === 't'];
          }

          if (row[i] === 'null') {
            return [k, null];
          }

          try {
            const parsed = JSON.parse(row[i] as string);
            if (typeof parsed === 'object') {
              return [k, parsed] as unknown;
            }
          } catch {
            // If JSON.parse fails, return the original value
          }
          return [k, row[i]];
        })
        .filter((entry): entry is [K, V] => entry !== undefined),
    );
  }) as Record<K, V>[];
}
