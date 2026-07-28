import generate from '@babel/generator';
import parser from '@babel/parser';
import traverse from '@babel/traverse';
import { describe, expect, it } from 'vitest';
import {
  addOpenApiObject,
  attachOpenApiMeta,
  generateObjectProps,
} from './addOpenApiMeta.mjs';

const generateCode = generate.default ?? generate;
const traverseAst = traverse.default ?? traverse;

function parseInitialiser(source) {
  const ast = parser.parse(source, { sourceType: 'module' });
  let initialiser;

  traverseAst(ast, {
    VariableDeclarator(path) {
      initialiser = path.node.init;
    },
  });

  return initialiser;
}

describe('OpenAPI metadata generation', () => {
  it('emits Zod 4 metadata', () => {
    const schema = parseInitialiser('const schema = z.string();');
    const result = addOpenApiObject(schema, [
      generateObjectProps('id', 'ExampleSchema'),
    ]);

    expect(generateCode(result).code).toBe(
      'z.string().meta({\n  id: "ExampleSchema"\n})',
    );
  });

  it('preserves object fields named description inside arrays', () => {
    const schema = parseInitialiser(`
      const schema = z.array(
        z.object({
          description: z.string().describe('A description'),
        }),
      );
    `);
    const result = attachOpenApiMeta(schema, {}, [
      { description: 'Example description' },
    ]);
    const output = generateCode(result).code;

    expect(output).toContain(
      "description: z.string().describe('A description')",
    );
    expect(output).not.toContain('z.object().meta');
  });

  it('merges examples into existing metadata', () => {
    const schema = parseInitialiser(`
      const schema = z.object({
        name: z.string().meta({ description: 'A name' }),
      });
    `);
    const result = attachOpenApiMeta(schema, {}, { name: 'Ada' });
    const output = generateCode(result).code;

    expect(output).toContain("description: 'A name'");
    expect(output).toContain('example: "Ada"');
    expect(output.match(/\.meta\(/g)).toHaveLength(1);
  });

  it('finds object fields through refinement chains', () => {
    const schema = parseInitialiser(`
      const schema = z
        .object({ name: z.string() })
        .refine((value) => value.name.length > 0);
    `);
    const result = attachOpenApiMeta(schema, {}, { name: 'Ada' });

    expect(generateCode(result).code).toContain(
      'name: z.string().meta({\n    example: "Ada"\n  })',
    );
  });
});
