import * as t from '@babel/types';

const hasObjectProperty = (node, property) =>
  t.isCallExpression(node) &&
  t.isMemberExpression(node.callee) &&
  node.callee.property.name === property &&
  node.arguments.length > 0 &&
  t.isObjectExpression(node.arguments[0]);

const camelToTitle = (camelCase) =>
  camelCase
    .replace(/([A-Z])/g, (match) => ` ${match}`)
    .replace(/^./, (match) => match.toUpperCase())
    .trim();

const generateObjectDescription = (keys) => {
  const descriptions = keys.map((key) => camelToTitle(key).toLowerCase() + 's');
  console.log(descriptions);
  const end = descriptions[descriptions.length - 1];
  const list = descriptions.slice(0, descriptions.length - 1);
  if (!keys.length) {
    ('Returns a list');
  }
  return `A list of ${list.join(', ')}${list.length ? `${list.length > 2 ? ', ' : ''} and ` + end : end + 's'}`;
};

function hasDescription(node) {
  // Case 1: description in Zod constructor args, e.g., z.string({ description: '...' })
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

  // Case 2: description in openapi metadata call
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

function normalizeZodDescription(node, descriptionValue) {
  // Case: z.string({ description: '...' }) — extract and move description to openapi()
const described = hasDescription(node);

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
      const descriptionValue = descriptionProp.value;

      // Remove original description from args
      props.splice(descriptionPropIndex, 1);

      // Remove empty object if no other options remain
      if (props.length === 0) {
        node.arguments = [];
      }

      // Append .openapi({ description })
      return t.callExpression(
        t.memberExpression(node, t.identifier('openapi')),
        [
          t.objectExpression([
            t.objectProperty(t.identifier('description'), descriptionValue),
          ]),
        ],
      );
    }
  }
  // Case: no description at all — return undefined
  if (!described && descriptionValue) {
    return t.callExpression(t.memberExpression(node, t.identifier('openapi')), [
      t.objectExpression([
        t.objectProperty(
          t.identifier('description'),
          t.valueToNode(descriptionValue),
        ),
      ]),
    ]);
  }

  return node;
}

// Recursively add the `openapi` meta object onto nested object properties.
// This is only really needed for Response objects.
export function attachDescriptions(
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
            prop.value = attachDescriptions(
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
        node.arguments[0] = attachDescriptions(
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

    // if already has a meta object, ignore
    if (t.isMemberExpression(callee) && callee.property.name === 'openapi') {
      return node;
    }

    // leaf node

    const description =
      descriptionValue && descriptionValue.description
        ? descriptionValue.description
        : undefined;
    node = normalizeZodDescription(node, description);

    if (
      // exampleValues &&
      t.isCallExpression(node) &&
      t.isMemberExpression(node.callee) &&
      node.callee.property.name === 'openapi' &&
      node.arguments.length > 0
      // t.isObjectExpression(node.arguments[0])
    ) {
      console.log(callee);
    //   const arg = node.arguments[0];
    //   const props = arg.properties;

    //   const openApiProp = props.find(
    //     (prop) =>
    //       t.isObjectProperty(prop) &&
    //       t.isIdentifier(prop.key, {
    //         name: 'openapi',
    //       }),
    //   );

      // console.log(openApiProp)
      if (node.callee.arguments) {
        const example = t.objectProperty(
          t.identifier('example'),
          t.valueToNode(exampleValues || 'example'),
        );
        t.appendToMemberExpression(node.callee.arguments[0].callee, example);
      }
    }

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
