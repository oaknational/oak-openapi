import Ajv2020 from 'ajv/dist/2020';
import { readJsonSync, parseArgs } from './lib.js';

export function validateSchema(schemaPath: string, files: string[]): number {
  if (!files.length) {
    console.log('[ERROR] No data files provided.');
    return 2;
  }

  const schema = readJsonSync(schemaPath);
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validate = ajv.compile(schema as object);

  let hasErrors = false;

  for (const file of files) {
    const data = readJsonSync(file);
    const ok = validate(data);
    if (!ok) {
      hasErrors = true;
      console.log(`\n[ERROR] ${file} failed schema validation:`);
      for (const err of validate.errors || []) {
        const instancePath = err.instancePath || '(root)';
        const message = err.message || 'schema error';
        console.log(`  - ${instancePath} ${message}`);
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
  const exitCode = main();
  process.exit(exitCode);
}
