import { readFileSync, existsSync } from 'fs';
import { parse, visit, OperationDefinitionNode, SelectionSetNode, FieldNode } from 'graphql';
import { basename } from 'path';
import glob from 'fast-glob';

if (!process.argv[2]) {
  console.error('Usage: tsx bin/zod-from-gql.ts <query-file.gql|partial-filename>');
  process.exit(1);
}

const input = process.argv[2];
let gqlFilePath: string;

// Check if input is a full file path that exists
if (existsSync(input)) {
  gqlFilePath = input;
} else {
  // Search for matching .gql or .graphql files
  const patterns = [
    `**/*${input}*.gql`,
    `**/*${input}*.graphql`,
    `**/${input}.gql`,
    `**/${input}.graphql`
  ];
  
  let matchingFiles: string[] = [];
  
  for (const pattern of patterns) {
    const files = glob.sync(pattern);
    matchingFiles = matchingFiles.concat(files);
  }
  
  // Remove duplicates
  matchingFiles = [...new Set(matchingFiles)];
  
  if (matchingFiles.length === 0) {
    console.error(`No .gql or .graphql files found matching "${input}"`);
    process.exit(1);
  }
  
  if (matchingFiles.length > 1) {
    console.error(`Multiple files found matching "${input}":`);
    matchingFiles.forEach(file => console.error(`  - ${file}`));
    console.error('Please be more specific or use the full path.');
    process.exit(1);
  }
  
  gqlFilePath = matchingFiles[0];
}

console.log(`// Generated from: ${gqlFilePath}`);
const gqlFile = readFileSync(gqlFilePath, 'utf-8');
const ast = parse(gqlFile);

function generateZodSchemaFromSelectionSet(selectionSet: SelectionSetNode, depth = 0): string {
  const fields: string[] = [];
  const indent = '  '.repeat(depth + 1);

  for (const selection of selectionSet.selections) {
    if (selection.kind === 'Field') {
      const fieldNode = selection as FieldNode;
      const fieldName = fieldNode.name.value;
      
      if (fieldNode.selectionSet) {
        // This field has nested selections, so it's an object or array of objects
        const nestedSchema = generateZodSchemaFromSelectionSet(fieldNode.selectionSet, depth + 1);
        fields.push(`${indent}${fieldName}: z.object({\n${nestedSchema}\n${indent}})`);
      } else {
        // This is a scalar field - we'll make it optional by default since GraphQL can return null
        fields.push(`${indent}${fieldName}: z.string().optional()`);
      }
    }
  }

  return fields.join(',\n');
}

visit(ast, {
  OperationDefinition(node: OperationDefinitionNode) {
    if (node.operation === 'query' && node.selectionSet) {
      const fileName = basename(gqlFilePath, '.gql').replace('.graphql', '');
      const schemaName = fileName.replace(/[^a-zA-Z0-9]/g, '') + 'Schema';
      
      // Check if this is a root query that returns an array
      const rootField = node.selectionSet.selections[0] as FieldNode;
      const rootFieldName = rootField.name.value;
      
      let zodSchema: string;
      
      if (rootField.selectionSet) {
        const objectSchema = generateZodSchemaFromSelectionSet(rootField.selectionSet);
        
        // Assume array return type for plural field names or if it contains 'all'
        if (rootFieldName.includes('all') || rootFieldName.endsWith('s')) {
          zodSchema = `export const ${schemaName} = z.array(z.object({\n${objectSchema}\n}));\n`;
        } else {
          zodSchema = `export const ${schemaName} = z.object({\n${objectSchema}\n});\n`;
        }
      } else {
        zodSchema = `export const ${schemaName} = z.string().optional();\n`;
      }
      
      console.log(`import { z } from 'zod';\n`);
      console.log(zodSchema);
      console.log(`export type ${schemaName.replace('Schema', '')} = z.infer<typeof ${schemaName}>;`);
    }
  },
});
