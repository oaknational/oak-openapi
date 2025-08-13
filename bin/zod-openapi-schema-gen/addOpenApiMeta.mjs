import * as t from '@babel/types';

const hasObjectProperty = (node, property) =>
  t.isCallExpression(node) &&
  t.isMemberExpression(node.callee) &&
  node.callee.property.name === property &&
  node.arguments.length > 0 &&
  t.isObjectExpression(node.arguments[0]);

function getObjectExpressionDescriptionIndex(node) {
  if (t.isCallExpression(node) && node.arguments.length > 0) {
    const indexOfDesc = node.arguments.findIndex(
      (arg) =>
        arg &&
        arg.properties &&
        t.isObjectExpression(arg) &&
        arg.properties.some(
          (prop) =>
            t.isObjectProperty(prop) &&
            t.isIdentifier(prop.key, {
              name: 'description',
            }),
        ),
    );
    return indexOfDesc;
  }
  return -1;
}

function hasDescription(node) {
  // description in Zod constructor args, e.g., z.string({ description: '...' })

  if (
    t.isCallExpression(node) &&
    node.arguments.length > 0 &&
    t.isObjectExpression(node.arguments[0]) &&
    node.arguments[0].properties.some(
      (prop) =>
        t.isObjectProperty(prop) &&
        t.isIdentifier(prop.key, {
          name: 'description',
        }),
    )
  ) {
    return true;
  }

  // description in openapi metadata call
  if (
    hasObjectProperty(node, 'openapi') &&
    node.arguments[0].properties.some(
      (prop) =>
        t.isObjectProperty(prop) &&
        t.isIdentifier(prop.key, {
          name: 'description',
        }),
    )
  ) {
    return true;
  }

  return false;
}

export function addOpenApiObject(node, properties) {
  const objectProperties = properties.map((prop) =>
    t.isNode(prop.value)
      ? prop.value
      : t.objectProperty(t.identifier(prop.key), t.valueToNode(prop.value)),
  );

  return t.callExpression(t.memberExpression(node, t.identifier('openapi')), [
    t.objectExpression(objectProperties),
  ]);
}

export const generateObjectProps = (key, value) => ({ key, value });

function replaceObjectPropertyLocation(
  node,
  propertyKey,
  additionalProps = [],
) {
  const argIndex = getObjectExpressionDescriptionIndex(node) ?? 0;

  if (
    t.isCallExpression(node) &&
    node.arguments.length > 0 &&
    t.isObjectExpression(node.arguments[argIndex])
  ) {
    // find the index with properties
    const arg = node.arguments[argIndex];

    const props = arg.properties;

    const objectPropIndex = props.findIndex(
      (prop) =>
        t.isObjectProperty(prop) &&
        t.isIdentifier(prop.key, {
          name: propertyKey,
        }),
    );

    if (objectPropIndex !== -1) {
      const objectProperty = props[objectPropIndex];
      const objValue = objectProperty.value.value ?? objectProperty.value;
      // Remove original description from args
      if (argIndex) {
        node.arguments.splice(argIndex);
      } else {
        props.splice(objectPropIndex, 1);

        // Remove empty object if no other options remain
        if (props.length === 0) {
          node.arguments = [];
        }
      }

      const objProp = generateObjectProps(propertyKey, objValue);
      // Append .openapi({ [property] })
      return addOpenApiObject(node, [objProp, ...additionalProps]);
    }
  }
  return node;
}

function normalizeZodObject(node, descriptionValue, exampleValue) {
  // z.string({ description: '...' }) — extract and move description to openapi()
  const described = hasDescription(node);
  const exampleProp = generateObjectProps('example', exampleValue);

  if (described) {
    return replaceObjectPropertyLocation(
      node,
      'description',
      exampleProp ? [exampleProp] : [],
    );
  }
  // Case: no description at all — return undefined
  if (!described && descriptionValue) {
    const descProp = generateObjectProps('description', descriptionValue);
    return addOpenApiObject(node, [exampleProp, descProp]);
  }

  return node;
}

// Recursively add the `openapi` meta object onto nested object properties.
// This is only really needed for Response objects.
export function attachOpenApiMeta(
  node,
  descriptionValue,
  exampleValues,
  importedIdents = new Set(),
  depth = 0,
) {
  if (t.isCallExpression(node)) {
    const callee = node.callee;

    // for nested objects
    if (t.isMemberExpression(callee) && callee.property.name === 'object') {
      const arg = node.arguments[0];
      const properties = arg.properties;
      if (t.isObjectExpression(arg) && properties && properties.length) {
        properties.forEach((prop) => {
          if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
            prop.value = attachOpenApiMeta(
              prop.value,
              descriptionValue?.[prop.key.name],
              exampleValues?.[prop.key.name],
              importedIdents,
              depth + 1,
            );
          }
        });
      }

      return node;
    }

    if (t.isMemberExpression(callee) && callee.property.name === 'array') {
      const innerArg = node.arguments[0];
      const objectExample = generateObjectProps('example', exampleValues);
      const objectDesc = generateObjectProps('description', descriptionValue);
      if (innerArg) {
        node.arguments[0] = attachOpenApiMeta(
          innerArg,
          descriptionValue,
          exampleValues,
          importedIdents,
          depth + 1,
        );

        // these arrays only exist in the output,
        // which doesn't need an example
        // const exp = getObjectExpressionWithDescription(innerArg);

        node.arguments[0] = replaceObjectPropertyLocation(
          innerArg,
          'description',
          [],
        );
      }

      // replace all the nested object descriptions too
      if (depth > 0) {
        // const exp = getObjectExpressionWithDescription(node);
        // if (exp > -1) {
        return replaceObjectPropertyLocation(
          node,
          'description',
          objectExample ? [objectExample] : [],
        );
        // }

        // return addOpenApiObject(node, [objectDesc, objectExample]);
      }

      return node;
    }

    // if already has a meta object, add example
    if (t.isMemberExpression(callee) && callee.property.name === 'openapi') {
      return node;
    }

    // leaf node

    const description =
      descriptionValue && descriptionValue.description
        ? descriptionValue.description
        : undefined;
    node = normalizeZodObject(node, description, exampleValues);

    return node;
  }
  // // Leaf nodes for imported schemas
  // if (t.isIdentifier(node) && importedIdents.has(node.name)) {
  //     // find openapi
  //     // tack on description

  //     const object = findObjectProperty(node, 'openapi');
  //     if(object) {
  //         return node
  //     }
  //     return t.callExpression(t.memberExpression(node, t.identifier('openapi')), [
  //         t.objectExpression([
  //             t.objectProperty(t.identifier('description'), t.valueToNode(descriptionValue)),
  //         ]),
  //     ]);
  // }

  return node;
}

// Recursively add the `openapi` meta object onto nested object properties.
// This is only really needed for Request objects.
export function attachOpenAPICalls(
  node,
  exampleValue,
  importedIdents = new Set(),
) {
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
              prop.value = attachOpenAPICalls(
                prop.value,
                exampleValue?.[prop.key.name],
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

  // Leaf nodes for imported schemas
  if (t.isIdentifier(node) && importedIdents.has(node.name)) {
    return t.callExpression(t.memberExpression(node, t.identifier('openapi')), [
      t.objectExpression([
        t.objectProperty(t.identifier('example'), t.valueToNode(exampleValue)),
      ]),
    ]);
  }

  return node;
}
