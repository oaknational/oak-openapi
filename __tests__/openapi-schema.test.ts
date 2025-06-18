import { it, expect } from 'vitest';
import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import { openApiDocument } from '@/lib/zod-openapi/schema/generateDocument';
import type { OpenAPIV3 } from 'openapi-types';

// this object is no longer the same document type annoyingly. paths isn't a readable object
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

  if ('nullable' in newSchema) {
    // delete newSchema.nullable;
  }

  if ('anyOf' in newSchema && Array.isArray(newSchema.anyOf)) {
    newSchema.anyOf = newSchema.anyOf.map((subSchema) => {
      return fixNullable(subSchema as OpenAPIV3.SchemaObject);
    });
  }

  if ('properties' in newSchema) {
    for (const key in newSchema.properties) {
      newSchema.properties[key] = fixNullable(
        newSchema.properties[key] as OpenAPIV3.SchemaObject,
      );
    }
  }

  if ('items' in newSchema) {
    newSchema.items = fixNullable(newSchema.items as OpenAPIV3.SchemaObject);
  }

  return newSchema;
}

function validateExample(
  schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | null | undefined,
  example: unknown,
): [boolean, ErrorObject[]?] {
  if (!schema || !example) return [false];

  const fixedSchema = fixNullable(schema as OpenAPIV3.SchemaObject);
  const validate = ajv.compile(fixedSchema);
  const res = validate(example);

  return [res, validate.errors ? validate.errors : undefined];
}

for (const [path, methods] of Object.entries(swaggerData.paths)) {
  if (!methods) continue;

  for (const [method, details] of Object.entries(methods)) {
    // also check if details is an object
    if (!details || typeof details !== 'object') continue;

    if (!('responses' in details)) {
      continue;
    }

    it(`${method.toUpperCase()} ${path} should have a description`, () => {
      if (details.description === undefined) {
        expect.fail(`${method.toUpperCase()} ${path} missing description`);
      }
    });

    if (!details.responses) continue;

    for (const [statusCode, response] of Object.entries(details.responses)) {
      if (statusCode === 'default') continue;
      let resolvedResponse: typeof response | null = response;

      // Resolve references in responses
      if ('$ref' in response) {
        resolvedResponse = resolveRef(response.$ref);
        if (!resolvedResponse) {
          it(`${method.toUpperCase()} ${path} - Response reference should exist`, () => {
            throw new Error(`Response reference not found: ${response.$ref}`);
          });
          continue;
        }
      }

      if (!('content' in resolvedResponse)) continue;

      const content = resolvedResponse?.content?.['application/json'];
      it(`${method.toUpperCase()} ${path} should have an application/json response schema`, () => {
        if (!content) {
          expect.fail(
            `${method.toUpperCase()} ${path} missing application/json response schema`,
          );
        }
      });

      if (!content) continue;

      const schemaRef =
        content.schema && '$ref' in content.schema
          ? getSchema(content.schema.$ref)
          : content.schema;
      const example = content.example;

      it.skip(`${method.toUpperCase()} ${path} should have a response example`, () => {
        if (!example) {
          expect.fail(`${method.toUpperCase()} ${path} missing example`);
        }
      });

      if (!example) continue;

      // FIXME I'm exiting early here. It's because trpc-openapi is generating
      // the example schema in a way that doesn't match the actual the actual
      // examples structurally. I think this is a bug in trpc-openapi, but it
      // also maps the zod schema being transformed to json, so it's a bit more
      // complicated than any quick fix. For now, I've manually verified that the
      // examples match the schema, so I'm just going prevent these tests from
      // running for now.
      // continue;

      it(`${method.toUpperCase()} ${path} response example should match schema`, () => {
        if (!schemaRef) {
          throw new Error(
            `Schema not found for ${method.toUpperCase()} ${path} (${statusCode})`,
          );
        }

        const [isValid, errors = null] = validateExample(schemaRef, example);

        if (!isValid) {
          throw new Error(`Example does not match schema.`);
          console.log(errors);
        }
        expect(isValid).toBe(true);
      });
    }
  }
}
