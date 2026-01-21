import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import { openApiDocument } from '@/lib/zod-openapi/schema/generateDocument';
import type { OpenAPIV3 } from 'openapi-types';

const swaggerData: OpenAPIV3.Document =
  openApiDocument as unknown as OpenAPIV3.Document;

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

function resolveRef(ref: string) {
  const refPath = ref.replace(/^#\/components\/responses\//, '');
  return swaggerData.components?.responses?.[refPath] || null;
}

function getSchema(ref: string) {
  const refPath = ref.replace(/^#\/components\/schemas\//, '');
  return swaggerData.components?.schemas?.[refPath] || null;
}

function fixNullable(schema: OpenAPIV3.SchemaObject): OpenAPIV3.SchemaObject {
  if (typeof schema !== 'object' || schema === null) return schema;
  const newSchema = structuredClone(schema) as OpenAPIV3.SchemaObject;
  if ('anyOf' in newSchema && Array.isArray(newSchema.anyOf)) {
    newSchema.anyOf = newSchema.anyOf.map((s) =>
      fixNullable(s as OpenAPIV3.SchemaObject),
    );
  }
  if ('properties' in newSchema && newSchema.properties) {
    for (const key in newSchema.properties) {
      newSchema.properties[key] = fixNullable(
        newSchema.properties[key] as OpenAPIV3.SchemaObject,
      );
    }
  }
  if ('items' in newSchema && newSchema.items) {
    newSchema.items = fixNullable(newSchema.items as OpenAPIV3.SchemaObject);
  }
  return newSchema;
}

function validateExample(
  schema: OpenAPIV3.SchemaObject | null | undefined,
  example: unknown,
): [boolean, ErrorObject[]?] {
  if (!schema || !example) return [false];
  const fixedSchema = fixNullable(schema);
  const validate = ajv.compile(fixedSchema);
  return [validate(example), validate.errors || undefined];
}

if (!swaggerData.paths) throw new Error(`Paths object undefined`);

const args = process.argv.slice(2);
const targetPath = args.find((arg) => !arg.startsWith('--'));
const showSchema = args.includes('--schema');
const showResults = args.includes('--results');

if (!targetPath) {
  console.log(
    'Usage: tsx bin/openapi-schema-single.ts <path> [--schema] [--results]',
  );
  console.log(
    'Example: tsx bin/openapi-schema-single.ts /lessons/{lesson}/quiz',
  );
  console.log('  --schema  : Show only the schema');
  console.log('  --results : Show only validation errors');
  console.log('\nAvailable paths:');
  Object.keys(swaggerData.paths)
    .sort()
    .forEach((p) => console.log(`  ${p}`));
  process.exit(1);
}

const methods = swaggerData.paths[targetPath];
if (!methods) {
  console.log(`❌ Path not found: ${targetPath}`);
  process.exit(1);
}

interface Issue {
  method: string;
  statusCode?: string;
  type: string;
  message: string;
  details?: {
    schema?: OpenAPIV3.SchemaObject;
    example?: unknown;
    errors?: ErrorObject[];
  };
}

const issues: Issue[] = [];

for (const [method, details] of Object.entries(methods)) {
  if (!details || typeof details !== 'object' || !('responses' in details))
    continue;

  if (details.description === undefined) {
    issues.push({
      method,
      type: 'missing_description',
      message: 'Missing description',
    });
  }

  if (!details.responses) continue;

  for (const [statusCode, response] of Object.entries(details.responses)) {
    if (statusCode === 'default') continue;
    let resolvedResponse: typeof response | null = response;

    if ('$ref' in response) {
      resolvedResponse = resolveRef(response.$ref);
      if (!resolvedResponse) {
        issues.push({
          method,
          statusCode,
          type: 'ref_not_found',
          message: `Response reference not found: ${response.$ref}`,
        });
        continue;
      }
    }

    if (!('content' in resolvedResponse)) continue;
    const content = resolvedResponse?.content?.['application/json'];
    if (!content) {
      issues.push({
        method,
        statusCode,
        type: 'missing_json_schema',
        message: 'Missing application/json response schema',
      });
      continue;
    }

    const schemaRef = (
      content.schema && '$ref' in content.schema
        ? getSchema(content.schema.$ref)
        : content.schema
    ) as OpenAPIV3.SchemaObject;

    const example = content.example ?? schemaRef?.example;
    if (!example) {
      issues.push({
        method,
        statusCode,
        type: 'missing_example',
        message: 'Missing example',
      });
      continue;
    }

    if (schemaRef) {
      const [isValid, errors] = validateExample(schemaRef, example);
      if (!isValid) {
        issues.push({
          method,
          statusCode,
          type: 'example_mismatch',
          message: 'Example does not match schema',
          details: { schema: schemaRef, example, errors: errors || undefined },
        });
      }
    }
  }
}

if (issues.length === 0) {
  console.log(`✅ ${targetPath} - All checks passed!`);
  process.exit(0);
}

// If only showing schema, find and show the first schema
if (showSchema && !showResults) {
  const firstSchemaIssue = issues.find((issue) => issue.details?.schema);
  if (firstSchemaIssue?.details?.schema) {
    console.log(JSON.stringify(firstSchemaIssue.details.schema, null, 2));
  } else {
    console.log('No schema found in validation errors');
  }
  process.exit(0);
}

// If only showing results, show just the errors
if (showResults && !showSchema) {
  const firstErrorIssue = issues.find((issue) => issue.details?.errors);
  if (firstErrorIssue?.details?.errors) {
    const uniqueErrors = new Map<string, ErrorObject>();
    firstErrorIssue.details.errors.forEach((err) => {
      const key = `${err.instancePath || '(root)'}:${err.message}`;
      if (!uniqueErrors.has(key)) {
        uniqueErrors.set(key, err);
      }
    });
    Array.from(uniqueErrors.values()).forEach((err) => {
      console.log(`${err.instancePath || '(root)'}: ${err.message}`);
    });
  } else {
    console.log('No validation errors found');
  }
  process.exit(0);
}

// Default: show full output
console.log(`\n🔴 Found ${issues.length} issue(s):\n`);

const grouped = new Map<string, Issue[]>();
for (const issue of issues) {
  if (!grouped.has(issue.type)) grouped.set(issue.type, []);
  grouped.get(issue.type)!.push(issue);
}

for (const [type, typeIssues] of grouped) {
  const first = typeIssues[0];
  console.log(`\n━━━━━━━ ${type.replace(/_/g, ' ').toUpperCase()} ━━━━━━━`);
  console.log(first.message);
  if (typeIssues.length > 1)
    console.log(`(${typeIssues.length} occurrences)\n`);
  else console.log();

  if (first.details?.schema) {
    console.log('EXPECTED SCHEMA:');
    console.log(
      JSON.stringify(first.details.schema, null, 2)
        .split('\n')
        .map((l) => '  ' + l)
        .join('\n'),
    );
  }

  if (first.details?.example) {
    console.log('\nACTUAL EXAMPLE:');
    console.log(
      JSON.stringify(first.details.example, null, 2)
        .split('\n')
        .map((l) => '  ' + l)
        .join('\n'),
    );
  }

  if (first.details?.errors?.length) {
    console.log('\nVALIDATION ISSUES:');
    const uniqueErrors = new Map<string, ErrorObject>();
    first.details.errors.forEach((err) => {
      const key = `${err.instancePath || '(root)'}:${err.message}`;
      if (!uniqueErrors.has(key)) {
        uniqueErrors.set(key, err);
      }
    });
    Array.from(uniqueErrors.values()).forEach((err) => {
      console.log(`  • ${err.instancePath || '(root)'}: ${err.message}`);
    });
  }

  if (typeIssues.length > 1) {
    console.log('\nAlso occurs at:');
    typeIssues.slice(1).forEach((issue) => {
      console.log(
        `  • ${issue.method.toUpperCase()}${issue.statusCode ? ` [${issue.statusCode}]` : ''}`,
      );
    });
  }
}

process.exit(1);
