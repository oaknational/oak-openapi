import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

const SCHEMA_PATTERN = /(Request|Response)\.schema\.ts$/;
const JSON_PATTERN = /(Request|Response)Example\.json$/;
const GENERATED_DIR = './src/lib/zod-openapi/generated';

function getAllFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function findAllSchemaFiles(rootDir) {
  return getAllFiles(rootDir).filter(
    (file) =>
      file.includes(`${path.sep}schemas${path.sep}`) &&
      SCHEMA_PATTERN.test(file),
  );
}

function findAllExampleJsonFiles(rootDir) {
  return getAllFiles(rootDir).filter((file) => JSON_PATTERN.test(file));
}

function getMatchingJson(schemaPath, allJsonFiles) {
  if (!schemaPath) {
    console.error('❌ schemaPath is undefined');
    return null;
  }

  const baseName = path.basename(schemaPath).replace('.schema.ts', '');
  const match = allJsonFiles.find(
    (jsonPath) =>
      path.basename(jsonPath).startsWith(baseName) &&
      path.basename(jsonPath).endsWith('Example.json'),
  );

  if (!match) {
    console.warn(`⚠️ No matching example JSON found for ${schemaPath}`);
  }

  return match;
}

function isFlatObject(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
  return Object.values(obj).every(
    (val) => typeof val !== 'object' || val === null,
  );
}

function attachOpenAPICalls(node, exampleValue) {
  if (t.isCallExpression(node)) {
    const callee = node.callee;

    // z.object({...})
    if (t.isMemberExpression(callee) && callee.property.name === 'object') {
      const arg = node.arguments[0];
      if (t.isObjectExpression(arg)) {
        arg.properties.forEach((prop) => {
          if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
            const key = prop.key.name;
            const example = exampleValue?.[key];
            prop.value = attachOpenAPICalls(prop.value, example);
          }
        });
      }
      return node;
    }

    // z.array(z.object(...))
    if (t.isMemberExpression(callee) && callee.property.name === 'array') {
      const innerArg = node.arguments[0];
      if (exampleValue && Array.isArray(exampleValue)) {
        const exampleItem = exampleValue[0];
        const updated = attachOpenAPICalls(innerArg, exampleItem);
        node.arguments[0] = updated;
      }
      return node;
    }

    // Already has .openapi()
    if (t.isMemberExpression(callee) && callee.property.name === 'openapi') {
      return node;
    }

    // Leaf node: string, number, etc.
    if (exampleValue !== undefined) {
      return t.callExpression(
        t.memberExpression(node, t.identifier('openapi')),
        [
          t.objectExpression([
            t.objectProperty(
              t.identifier('example'),
              t.valueToNode(exampleValue),
            ),
          ]),
        ],
      );
    }

    return node;
  }

  return node;
}
function fixImports(ast, schemaFilePath, outputFilePath) {
  traverse.default(ast, {
    ImportDeclaration(path) {
      const source = path.node.source.value;

      // Skip non-relative imports and aliases like '~'
      if (!source.startsWith('.') || source.startsWith('~')) return;

      try {
        const absImportPath = path.resolve(
          path.dirname(schemaFilePath),
          source,
        );
        let newRelPath = path.relative(
          path.dirname(outputFilePath),
          absImportPath,
        );

        if (!newRelPath.startsWith('.')) {
          newRelPath = './' + newRelPath;
        }

        path.node.source.value = newRelPath.replace(/\\/g, '/');
      } catch (err) {
        console.warn(`⚠️ Failed to rewrite import: ${source}`, err.message);
      }
    },
  });
}

function extractEndpointName(filename) {
  const base = path.basename(filename);
  const match = base.match(/^([a-z]+)[A-Z]/);
  return match ? match[1] : 'unknown';
}

function createInferredTypeAlias(varName, aliasName) {
  return t.exportNamedDeclaration(
    t.tsTypeAliasDeclaration(
      t.identifier(aliasName + 'OpenApi'),
      undefined,
      t.tsTypeReference(
        t.identifier('z.infer'),
        t.tsTypeParameterInstantiation([t.tsTypeQuery(t.identifier(varName))]),
      ),
    ),
    [],
  );
}
function getInferredTypeName(val) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}
function processSchemaFile(schemaFilePath, jsonFilePath) {
  if (!schemaFilePath || !jsonFilePath) {
    console.error('❌ Missing schema or JSON file path');
    return null;
  }

  const baseName = path.basename(schemaFilePath).replace('.schema.ts', '');
  const originalSchemaName = baseName + 'Schema';
  const openapiSchemaName = baseName + 'OpenAPISchema';

  let inputCode;
  try {
    inputCode = fs.readFileSync(schemaFilePath, 'utf-8');
  } catch (err) {
    console.error(
      `❌ Failed to read schema file: ${schemaFilePath}`,
      err.message,
    );
    return null;
  }

  let exampleJson;
  try {
    exampleJson = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
  } catch (err) {
    console.error(
      `❌ Failed to parse example JSON: ${jsonFilePath}`,
      err.message,
    );
    return null;
  }

  const exampleData = Array.isArray(exampleJson) ? exampleJson[0] : exampleJson;

  let ast;
  try {
    // import zod-openapi module
    ast = parser.parse(inputCode, {
      sourceType: 'module',
      plugins: ['typescript'],
    });
    const programNode = ast.program;
    const importPath = 'zod-openapi/extend';

    const alreadyExists = programNode.body.some(
      (n) => t.isImportDeclaration(n) && n.source.value === importPath,
    );

    if (!alreadyExists) {
      const importStatement = t.importDeclaration(
        [],
        t.stringLiteral(importPath),
      );
      const emptyLine = t.noop(); // This forces a blank line after the import

      programNode.body.unshift(emptyLine);
      programNode.body.unshift(importStatement);
    }
  } catch (err) {
    console.error(
      `❌ Failed to parse schema file: ${schemaFilePath}`,
      err.message,
    );
    return null;
  }

  traverse.default(ast, {
    VariableDeclarator(path) {
      if (path.node.id.name !== originalSchemaName) return;

      try {
        // Rename variable to OpenAPI name
        path.node.id.name = openapiSchemaName;

        if (!t.isCallExpression(path.node.init)) return;

        // Only add `.openapi({ example })` at top level if it's a top-level array
        if (Array.isArray(exampleJson)) {
          path.node.init = t.callExpression(
            t.memberExpression(path.node.init, t.identifier('openapi')),
            [
              t.objectExpression([
                t.objectProperty(
                  t.identifier('example'),
                  t.valueToNode(exampleJson),
                ),
              ]),
            ],
          );
        }

        // Inject `.openapi({ example })`
        path.node.init = attachOpenAPICalls(
          path.node.init,
          exampleData,
          isFlatObject(path.node),
        );

        // Remove any existing type declarations with the same name
        const inferredTypeName = getInferredTypeName(baseName);

        const program = path.findParent((p) => p.isProgram());
        if (program && program.node.body) {
          program.node.body = program.node.body.filter((node) => {
            return !(
              t.isExportNamedDeclaration(node) &&
              t.isTSTypeAliasDeclaration(node.declaration) &&
              node.declaration?.id?.name === inferredTypeName + 'Type'
            );
          });
        }

        // ✅ Safely insert new inferred type alias
        const typeAliasNode = createInferredTypeAlias(
          openapiSchemaName,
          inferredTypeName,
        );

        path.parentPath.insertAfter(typeAliasNode);
      } catch (err) {
        console.error(
          `❌ Failed to process schema type in ${schemaFilePath}`,
          err.message,
        );
      }
    },
  });

  const endpointName = extractEndpointName(schemaFilePath);
  const outputPath = path.join(
    GENERATED_DIR,
    endpointName,
    path.basename(schemaFilePath).replace('.schema.ts', '.openapi.ts'),
  );

  fixImports(ast, schemaFilePath, outputPath);

  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  try {
    fs.writeFileSync(
      outputPath,
      generate.default(ast, { retainLines: true }).code,
    );
    console.log(`✅ Generated: ${outputPath}`);
  } catch (err) {
    console.error(`❌ Failed to write output file: ${outputPath}`, err.message);
    return null;
  }

  return outputPath;
}

function generatePerEndpointIndexes(endpointMap) {
  for (const [endpoint, files] of Object.entries(endpointMap)) {
    const exports = files.map((filePath) => {
      const relativePath = './' + path.basename(filePath).replace(/\.ts$/, '');
      return `export * from "${relativePath}";`;
    });

    const endpointIndexPath = path.join(GENERATED_DIR, endpoint, 'index.ts');
    fs.writeFileSync(endpointIndexPath, exports.join('\n') + '\n');
    formatWithPrettier(endpointIndexPath);
    console.log(`📦 Generated: ${endpointIndexPath}`);
  }
}

function generateGlobalIndex(endpointMap) {
  const allEndpointDirs = Object.keys(endpointMap);
  const indexExports = allEndpointDirs.map(
    (endpoint) => `export * as ${endpoint} from "./${endpoint}";`,
  );

  const indexPath = path.join(GENERATED_DIR, 'index.ts');
  fs.writeFileSync(indexPath, indexExports.join('\n') + '\n');
  formatWithPrettier(indexPath);
  console.log(`📦 Generated: ${indexPath}`);
}

function formatWithPrettier(pathName) {
  try {
    execSync(`bash -c "pnpm prettier --write ${pathName}"`, {
      stdio: 'inherit',
    });
    console.log('✨ Prettier formatted generated files');
  } catch (err) {
    console.error('❌ Prettier formatting failed:', err.message);
  }
}

function main() {
  const schemaFiles = findAllSchemaFiles('.');
  const jsonFiles = findAllExampleJsonFiles('.');
  const endpointMap = {};

  for (const schemaFile of schemaFiles) {
    const jsonFile = getMatchingJson(schemaFile, jsonFiles);
    if (!jsonFile) continue;

    const outputPath = processSchemaFile(schemaFile, jsonFile);
    if (outputPath) {
      const endpoint = extractEndpointName(schemaFile);
      if (!endpointMap[endpoint]) endpointMap[endpoint] = [];
      formatWithPrettier(outputPath);
      endpointMap[endpoint].push(outputPath);
    }
  }

  if (Object.keys(endpointMap).length > 0) {
    generatePerEndpointIndexes(endpointMap);
    generateGlobalIndex(endpointMap);
  } else {
    console.warn('⚠️ No schemas processed.');
  }
}

main();
