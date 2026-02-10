import { readFileSync } from 'fs';
import { readFile } from 'fs/promises';
import fg from 'fast-glob';

export function readJsonSync(filePath: string): unknown {
  try {
    const raw = readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `Failed to read JSON from ${filePath}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

export async function readJsonAsync(filePath: string): Promise<unknown> {
  try {
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(
      `Failed to load ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export interface ParsedArgs {
  schemaPath: string;
  files: string[];
}

export function parseArgs(argv: string[]): ParsedArgs {
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

export async function expandGlobPatterns(
  patterns: string[],
): Promise<string[]> {
  const files: string[] = [];

  for (const pattern of patterns) {
    // Check if it's a glob pattern
    if (/[*?[\]]/.test(pattern)) {
      const matches = await fg(pattern);
      if (matches.length > 0) {
        files.push(...matches.sort());
      } else {
        files.push(pattern);
      }
    } else {
      files.push(pattern);
    }
  }

  return files;
}
