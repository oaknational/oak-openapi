import * as t from '@babel/types';

function hasDescription(node) {
  // Case 1: description in Zod constructor args, e.g., z.string({ description: '...' })
  if (
        t.isCallExpression(node) &&
        node.arguments &&
        node.arguments.length > 0 &&
        node.arguments[0].arguments
    ) {
        const hasObjectProperties = t.isObjectExpression(node.arguments[0].arguments[0]) 
        if (!hasObjectProperties) {
            return false
        }
        const hasDesc = node.arguments[0].arguments[0].properties.some(
            (prop) =>
                t.isObjectProperty(prop) &&
                t.isIdentifier(prop.key, { name: 'description' })
            );
        
            return hasDesc
  }

    
   
  // Case 2: description in openapi metadata call
  if (
    t.isCallExpression(node) &&
    t.isMemberExpression(node.callee) &&
    node.callee.property.name === 'openapi' &&
    node.arguments.length > 0 &&
    t.isObjectExpression(node.arguments[0]) &&
    node.arguments[0].properties.some(
      (prop) =>
        t.isObjectProperty(prop) &&
        t.isIdentifier(prop.key, { name: 'description' })
    )
  ) {
    return true;
  }

  return false;
}

function normalizeZodDescription(node) {
  // Case: z.string({ description: '...' }) — extract and move description to openapi()
  const isDescribed = hasDescription(node)
//   console.log(isDescribed)
  if (
    t.isCallExpression(node) && isDescribed
  ) {
    const props = node.arguments[0].arguments[0].properties;
    const descriptionPropIndex = props.findIndex(
      (prop) =>
        t.isObjectProperty(prop) &&
        t.isIdentifier(prop.key, { name: 'description' })
    );

    if (descriptionPropIndex !== -1) {
      const descriptionProp = props[descriptionPropIndex];
      const descriptionValue = descriptionProp.value;

      // Remove original description from args
      props.splice(descriptionPropIndex, 1);

      // Remove empty object if no other options remain
      if (props.length === 0) {
        node.arguments[0].arguments = [];
      }

      // Append .openapi({ description })
      return t.callExpression(
        t.memberExpression(node, t.identifier('openapi')),
        [
          t.objectExpression([
            t.objectProperty(t.identifier('description'), descriptionValue),
          ]),
        ]
      );
    }
  }

  // Case: already has .openapi({ description }) — leave unchanged
  if (hasDescription(node)) {
    return node;
  }
}


// Recursively add the `openapi` meta object onto nested object properties.
// This is only really needed for Response objects.
export function attachDescriptions(node, descriptionValue, exampleValues, importedIdents = new Set()) {
  if (t.isCallExpression(node)) {
    const callee = node.callee;

    // for nested objects
    if (t.isMemberExpression(callee)) {
      const propName = callee.property.name;
      if (propName === 'object') {
        const arg = node.arguments[0];
        if (t.isObjectExpression(arg)) {
          arg.properties.forEach((prop) => {
            if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
                prop.value = attachDescriptions(
                    normalizeZodDescription(prop.value),
                    descriptionValue?.[prop.key.name],
                    exampleValues?.[prop.key.name],
                    importedIdents,
                );
            }
          });
        }
      }

      // if already has a meta object, ignore
      if (t.isMemberExpression(callee) && callee.property.name === 'openapi') {
        return node;
      }

      // leaf nodes
      if (exampleValues) {
        // const norm = normalizeZodDescription(node)
        // console.log(norm)

        const exampleProp = t.objectProperty(
                t.identifier('example'),
                t.valueToNode(exampleValues)
              );
               
        const descProp =  t.objectProperty(
                t.identifier('description'),
                t.valueToNode(descriptionValue.description)
              );

        const openapiProps = (descriptionValue && descriptionValue.description) ? [exampleProp, descProp] : [exampleProp];
       return t.callExpression(t.memberExpression(node, t.identifier('openapi')), [
            t.objectExpression([
               ...openapiProps
            ]),
        ]);
      }
    }
  }

  // Leaf nodes for imported schemas
//   if (t.isIdentifier(node) && importedIdents.has(node.name)) {
//     return t.callExpression(t.memberExpression(node, t.identifier('openapi')), [
//       t.objectExpression([
//         t.objectProperty(t.identifier('description'), t.valueToNode(descriptionValue)),
//       ]),
//     ]);
//   }

  return node;
}