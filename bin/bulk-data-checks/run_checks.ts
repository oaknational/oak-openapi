import { validateSchema } from './validate_schema.js';
import { checkReferences } from './check_references.js';
import { parseArgs } from './lib.js';
import path from 'node:path';

async function main(): Promise<number> {
  const { schemaPath, files } = parseArgs(process.argv);

  if (!files.length) {
    console.error(
      '[ERROR] No data files provided. Example: tsx run_checks.ts */*.json',
    );
    process.exit(2);
  }

  console.log('Running schema validation...');
  const schemaResult = validateSchema(
    schemaPath || path.join(__dirname, '..', '..', 'src/', 'schema.json'),
    files,
  );
  if (schemaResult !== 0) {
    console.error('\n[FAILED] Schema validation failed');
    return schemaResult;
  }

  console.log('\nRunning referential integrity checks...');
  const refResult = await checkReferences(files);
  if (refResult !== 0) {
    console.error('\n[FAILED] Referential integrity checks failed');
    return refResult;
  }

  console.log('\n[SUCCESS] All checks passed!');
  return 0;
}

main()
  .then((exitCode) => process.exit(exitCode))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
