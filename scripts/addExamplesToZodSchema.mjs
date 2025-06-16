// Combined full script with imported identifiers and unions handled
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
  const baseName = path.basename(schemaPath).replace('.schema.ts', '');
  return allJsonFiles.find(
    (jsonPath) =>
      path.basename(jsonPath).startsWith(baseName) &&
      path.basename(jsonPath).endsWith('Example.json'),
  );
}

function isFlatObject(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
  return Object.values(obj).every(
    (val) => typeof val !== 'object' || val === null,
  );
}

function attachOpenAPICalls(node, exampleValue, importedIdents = new Set()) {
  if (t.isCallExpression(node)) {
    const callee = node.callee;

    if (t.isMemberExpression(callee) && callee.property.name === 'openapi') {
      return node;
    }

    if (t.isMemberExpression(callee)) {
      const propName = callee.property.name;
      if (propName === 'object') {
        const arg = node.arguments[0];
        if (t.isObjectExpression(arg)) {
          arg.properties.forEach((prop) => {
            if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
              prop.value = attachOpenAPICalls(
                prop.value,
                exampleValue?.[prop.key.name],
                importedIdents,
              );
            }
          });
        }
      } else if (propName === 'array') {
        node.arguments[0] = attachOpenAPICalls(
          node.arguments[0],
          exampleValue?.[0],
          importedIdents,
        );
      } else if (propName === 'union' || propName === 'discriminatedUnion') {
        node.arguments[0] = t.isArrayExpression(node.arguments[0])
          ? t.arrayExpression(
              node.arguments[0].elements.map((e) =>
                attachOpenAPICalls(e, exampleValue, importedIdents),
              ),
            )
          : node.arguments[0];
      }

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
    }
  }

  if (t.isIdentifier(node) && importedIdents.has(node.name)) {
    return t.callExpression(t.memberExpression(node, t.identifier('openapi')), [
      t.objectExpression([
        t.objectProperty(t.identifier('example'), t.valueToNode(exampleValue)),
      ]),
    ]);
  }

  return node;
}

function fixImports(ast, schemaFilePath, outputFilePath) {
  traverse.default(ast, {
    ImportDeclaration(path) {
      const source = path.node.source.value;
      if (!source.startsWith('.') || source.startsWith('@')) return;

      try {
        const absImportPath = path.resolve(
          path.dirname(schemaFilePath),
          source,
        );
        let newRelPath = path.relative(
          path.dirname(outputFilePath),
          absImportPath,
        );
        if (!newRelPath.startsWith('.')) newRelPath = './' + newRelPath;
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
  const baseName = path.basename(schemaFilePath).replace('.schema.ts', '');
  const originalSchemaName = baseName + 'Schema';
  const openapiSchemaName = baseName + 'OpenAPISchema';

  let inputCode = fs.readFileSync(schemaFilePath, 'utf-8');
  const exampleJson = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
  const exampleData = Array.isArray(exampleJson) ? exampleJson[0] : exampleJson;

  const ast = parser.parse(inputCode, {
    sourceType: 'module',
    plugins: ['typescript'],
  });
  const programNode = ast.program;
  const importPath = 'zod-openapi/extend';
  if (
    !programNode.body.some(
      (n) => t.isImportDeclaration(n) && n.source.value === importPath,
    )
  ) {
    programNode.body.unshift(
      t.noop(),
      t.importDeclaration([], t.stringLiteral(importPath)),
    );
  }

  const localImports = new Map();
  traverse.default(ast, {
    ImportDeclaration(path) {
      const source = path.node.source.value;
      path.node.specifiers.forEach((specifier) => {
        if (t.isImportSpecifier(specifier)) {
          localImports.set(specifier.local.name, source);
        }
      });
    },
  });

  traverse.default(ast, {
    VariableDeclarator(path) {
      if (path.node.id.name !== originalSchemaName) return;
      path.node.id.name = openapiSchemaName;

      const importedIdents = new Set(localImports.keys());

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

      path.node.init = attachOpenAPICalls(
        path.node.init,
        exampleData,
        importedIdents,
      );

      const inferredTypeName = getInferredTypeName(baseName);
      const program = path.findParent((p) => p.isProgram());

      if (program && program.node.body) {
        program.node.body = program.node.body.filter(
          (node) =>
            !(
              t.isExportNamedDeclaration(node) &&
              t.isTSTypeAliasDeclaration(node.declaration) &&
              node.declaration?.id?.name === inferredTypeName
            ),
        );

        path.parentPath.insertAfter(
          createInferredTypeAlias(openapiSchemaName, inferredTypeName),
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

  if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }

  fs.writeFileSync(
    outputPath,
    generate.default(ast, { retainLines: true }).code,
  );
  console.log(`✅ Generated: ${outputPath}`);

  return outputPath;
}

function generatePerEndpointIndexes(endpointMap) {
  for (const [endpoint, files] of Object.entries(endpointMap)) {
    const exports = files.map(
      (filePath) =>
        `export * from "./${path.basename(filePath).replace(/\.ts$/, '')}";`,
    );
    const indexPath = path.join(GENERATED_DIR, endpoint, 'index.ts');
    fs.writeFileSync(indexPath, exports.join('\n') + '\n');
    formatWithPrettier(indexPath);
    console.log(`📦 Generated: ${indexPath}`);
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
