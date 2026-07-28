import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import {
  addOpenApiObject,
  attachOpenApiMeta,
  generateObjectProps,
} from './addOpenApiMeta.mjs';

const SCHEMA_PATTERN = /(Request|Response)\.schema\.ts$/;
const JSON_PATTERN = /(Request|Response)Example\.json$/;
const GENERATED_DIR = './src/lib/zod-openapi/generated';

// Get all directory files
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

// Find all the `schema.ts` files
function findAllSchemaFiles(rootDir) {
  return getAllFiles(rootDir).filter(
    (file) =>
      file.includes(`${path.sep}schemas${path.sep}`) &&
      SCHEMA_PATTERN.test(file),
  );
}

// Find all the EXAMPLE.json files
function findAllExampleJsonFiles(rootDir) {
  return getAllFiles(rootDir).filter((file) => JSON_PATTERN.test(file));
}

// Match the example JSON file to the schema file.
function getMatchingJson(schemaPath, allJsonFiles) {
  const baseName = path.basename(schemaPath).replace('.schema.ts', '');
  return allJsonFiles.find(
    (jsonPath) =>
      path.basename(jsonPath).startsWith(baseName) &&
      path.basename(jsonPath).endsWith('Example.json'),
  );
}

// We want to make sure imports are maintained, especially in Response files
function fixImports(ast, schemaFilePath, outputFilePath) {
  traverse.default(ast, {
    ImportDeclaration(importPath) {
      const source = importPath.node.source.value;
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
        importPath.node.source.value = newRelPath.replace(/\\/g, '/');
      } catch (err) {
        console.warn(`⚠️ Failed to rewrite import: ${source}`, err.message);
      }
    },
  });
}

// This is to find the name of the generated folder. For now, it matches the `handler` folder name
// This also makes imports easier in the specified handler
function extractEndpointName(filename) {
  // Can do some clever stuff for endpoint generation naming, but then imports become a nightmare
  // Keep this in there if wanting to better structure the generated files
  // const base = path.basename(filename);
  // const match = base.match(/^([a-z]+)[A-Z]/);
  // return match ? match[1] : 'unknown';
  return filename.split('/')[3] ?? 'all';
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
  const descriptionsJson = JSON.parse(
    fs.readFileSync('./src/lib/endpoint-docs/outputDescriptions.json', 'utf-8'),
  );

  const ast = parser.parse(inputCode, {
    sourceType: 'module',
    plugins: ['typescript'],
  });
  const programNode = ast.program;
  const importPath = 'zod-openapi';
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

  // Traverse the original file
  traverse.default(ast, {
    VariableDeclarator(path) {
      if (path.node.id.name !== originalSchemaName) return;
      path.node.id.name = openapiSchemaName;

      const importedIdents = new Set(localImports.keys());

      // if is a response schema, then tack the openapi meta object to the end
      const refName =
        originalSchemaName.charAt(0).toUpperCase() +
        originalSchemaName.slice(1);

      path.node.init = attachOpenApiMeta(
        path.node.init,
        descriptionsJson,
        exampleJson,
        importedIdents,
      );

      if (originalSchemaName.includes('Response')) {
        const refProp = generateObjectProps('id', refName);
        const exampleProp = generateObjectProps('example', exampleJson);

        const props = [refProp, exampleProp];
        path.node.init = addOpenApiObject(path.node.init, props);
      }

      const inferredTypeName = getInferredTypeName(baseName);
      const program = path.findParent((p) => p.isProgram());
      // Ignore all types, we only want schemas!
      // Remove any existing type declarations / exports which might clash with the existing file
      if (program && program.node.body) {
        program.node.body = program.node.body.filter(
          (node) =>
            !(
              t.isExportNamedDeclaration(node) &&
              t.isTSTypeAliasDeclaration(node.declaration)
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

  fs.writeFileSync(outputPath, generate.default(ast).code);

  console.log(`✅ Generated: ${outputPath}`);

  return outputPath;
}

function generatePerEndpointIndexes(endpointMap) {
  for (const endpoint of Object.keys(endpointMap)) {
    const endpointDirectory = path.join(GENERATED_DIR, endpoint);
    const exports = fs
      .readdirSync(endpointDirectory)
      .filter((fileName) => fileName.endsWith('.openapi.ts'))
      .sort()
      .map((fileName) => `export * from "./${fileName.replace(/\.ts$/, '')}";`);
    const indexPath = path.join(GENERATED_DIR, endpoint, 'index.ts');
    fs.writeFileSync(indexPath, exports.join('\n') + '\n');
    console.log(`📦 Generated: ${indexPath}`);
  }
}

function generateGlobalIndex() {
  const allEndpointDirs = fs
    .readdirSync(GENERATED_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const indexExports = allEndpointDirs.map(
    (endpoint) => `export * as ${endpoint} from "./${endpoint}";`,
  );
  const indexPath = path.join(GENERATED_DIR, 'index.ts');
  fs.writeFileSync(indexPath, indexExports.join('\n') + '\n');
  console.log(`📦 Generated: ${indexPath}`);
}

function formatWithPrettier(pathNames) {
  try {
    execFileSync(
      'pnpm',
      ['prettier', '--write', '--log-level=warn', ...pathNames],
      { stdio: 'inherit' },
    );
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
      endpointMap[endpoint].push(outputPath);
    }
  }

  if (Object.keys(endpointMap).length > 0) {
    generatePerEndpointIndexes(endpointMap);
    generateGlobalIndex();
    formatWithPrettier(
      getAllFiles(GENERATED_DIR).filter((file) => file.endsWith('.ts')),
    );
  } else {
    console.warn('⚠️ No schemas processed.');
  }
}

main();
