#!/usr/bin/env node
import { readFileSync } from 'fs';
import Ajv2020 from 'ajv/dist/2020';

function readJson(filePath: string): Record<string, unknown> {
  try {
    const raw = readFileSync(filePath, 'utf8');
    return JSON.parse(raw) as Record<string, unknown>;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to read JSON from ${filePath}: ${errorMsg}`);
  }
}

interface ParsedArgs {
  schemaPath: string;
  files: string[];
}

// this needs to support getting the path such as '/sequence/0/examSubjects` from the data, to print the value in the error logs
function getFromPath(path: string, data: Record<string, unknown>): unknown {
  const parts = path.split('/').filter(Boolean);
  let current: unknown = data;
  for (const part of parts) {
    if (typeof current === 'object' && current !== null && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return current;
}

function parseArgs(argv: string[]): ParsedArgs {
  const args = argv.slice(2);
  let schemaPath = 'schema.json';
  const files: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--schema' || arg === '-s') {
      schemaPath = args[i + 1];
      i += 1;
      continue;
    }
    files.push(arg);
  }

  return { schemaPath, files };
}

export function validateSchema(schemaPath: string, files: string[]): number {
  if (!files.length) {
    console.log('[ERROR] No data files provided.');
    return 2;
  }

  const schema = readJson(schemaPath);
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validate = ajv.compile(schema);

  let hasErrors = false;

  for (const file of files) {
    const data = readJson(file);
    const ok = validate(data);
    if (!ok) {
      hasErrors = true;
      console.log(`\n[ERROR] ${file} failed schema validation:`);

      // Collect errors and count occurrences
      const errorMap = new Map<
        string,
        { count: number; instancePath: string; params: Record<string, unknown> }
      >();
      for (const err of validate.errors || []) {
        const instancePath = err.instancePath || '(root)';
        const message = err.message || 'schema error';

        if (errorMap.has(message)) {
          const existing = errorMap.get(message);
          if (existing) {
            existing.count++;
          }
        } else {
          errorMap.set(message, {
            count: 1,
            instancePath,
            params: err.params,
          });
        }
      }

      // Print each unique error with its count
      for (const [message, details] of errorMap) {
        console.log(
          `  - ${details.instancePath} ${message} (\x1b[1m×${details.count}\x1b[0m)`,
        );
        for (const param in details.params) {
          const value = details.params[param];
          console.log(`      ${param}: ${JSON.stringify(value)}`);
          // also print the value that's in the instance path if the param is `additionalProperty` or `missingProperty`
          if (param === 'additionalProperty') {
            const current = getFromPath(
              `${details.instancePath}/${String(value)}`,
              data,
            );
            console.log(`      instance value: ${JSON.stringify(current)}`);
          } else if (param === 'allowedValues' || param === 'type') {
            const current = getFromPath(details.instancePath, data);
            console.log(`      instance value: ${JSON.stringify(current)}`);
          } else if (param === 'missingProperty') {
            // nop
          } else {
            console.log(`      UNHANDLED PARAM: ${param}`);
          }
        }
        console.log('');
      }
    } else {
      console.log(`${file}: OK`);
    }
  }

  return hasErrors ? 1 : 0;
}

function main(): number {
  const { schemaPath, files } = parseArgs(process.argv);
  return validateSchema(schemaPath, files);
}

// Only run main if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(main());
}
