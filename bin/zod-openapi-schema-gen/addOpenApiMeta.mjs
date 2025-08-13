import * as t from '@babel/types';

const hasObjectProperty = (node, property) =>
  t.isCallExpression(node) &&
  t.isMemberExpression(node.callee) &&
  node.callee.property.name === property &&
  node.arguments.length > 0 &&
  t.isObjectExpression(node.arguments[0]);

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

const camelToTitle = (camelCase) =>
  camelCase
    .replace(/([A-Z])/g, (match) => ` ${match}`)
    .replace(/^./, (match) => match.toUpperCase())
    .trim();

const generateObjectDescription = (keys) => {
  const descriptions = keys.map((key) => camelToTitle(key).toLowerCase() + 's');
  const end = descriptions[descriptions.length - 1];
  const list = descriptions.slice(0, descriptions.length - 1);
  if (!keys.length) {
    ('Returns a list');
  }
  return `A list of ${list.join(', ')}${list.length ? `${list.length > 2 ? ', ' : ''} and ` + end : end + 's'}`;
};

export function addOpenApiObject(node, properties) {
  // console.log(properties);
  const objectProperties = properties.map((prop) =>
    t.isNode(prop.value)
      ? prop.value
      : t.objectProperty(t.identifier(prop.key), t.valueToNode(prop.value)),
  );
  console.log(objectProperties);

  return t.callExpression(t.memberExpression(node, t.identifier('openapi')), [
    t.objectExpression(objectProperties),
  ]);
}

export const generateObjectProps = (key, value) => ({ key, value });

function normalizeZodObject(node, descriptionValue, exampleValue) {
  // z.string({ description: '...' }) — extract and move description to openapi()
  const described = hasDescription(node);
  const exampleProp = generateObjectProps('example', exampleValue);

  if (
    t.isCallExpression(node) &&
    node.arguments.length > 0 &&
    t.isObjectExpression(node.arguments[0]) &&
    described
  ) {
    const arg = node.arguments[0];
    const props = arg.properties;

    const descriptionPropIndex = props.findIndex(
      (prop) =>
        t.isObjectProperty(prop) &&
        t.isIdentifier(prop.key, {
          name: 'description',
        }),
    );

    if (descriptionPropIndex !== -1) {
      const descriptionProp = props[descriptionPropIndex];
      const descriptionPropsValue = descriptionProp.value.value;

      // Remove original description from args
      props.splice(descriptionPropIndex, 1);

      // Remove empty object if no other options remain
      if (props.length === 0) {
        node.arguments = [];
      }

      const descProp = generateObjectProps(
        'description',
        descriptionPropsValue,
      );
      // Append .openapi({ description })
      return addOpenApiObject(node, [exampleProp, descProp]);
    }
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

      if (innerArg) {
        node.arguments[0] = attachOpenApiMeta(
          innerArg,
          descriptionValue,
          exampleValues,
          importedIdents,
          depth + 1,
        );
      }
      // add a summary at the end

      if (depth > 0) {
        const keys =
          innerArg.arguments &&
          innerArg.arguments[0] &&
          innerArg.arguments[0].properties &&
          innerArg.arguments[0].properties.length
            ? innerArg.arguments[0].properties.map(({ key }) => key.name)
            : [];
        const generatedDescription = generateObjectDescription(keys);

        return t.callExpression(
          t.memberExpression(node, t.identifier('openapi')),
          [
            t.objectExpression([
              t.objectProperty(
                t.identifier('description'),
                t.valueToNode(generatedDescription),
              ),
            ]),
          ],
        );
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
  //     console.log(object)
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
