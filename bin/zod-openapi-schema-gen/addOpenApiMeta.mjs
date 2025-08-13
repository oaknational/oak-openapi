import * as t from '@babel/types';

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
  const argIndex = getObjectExpressionDescriptionIndex(node);
  const index = argIndex > -1 ? argIndex : 0;

  if (
    t.isCallExpression(node) &&
    node.arguments.length > 0 &&
    t.isObjectExpression(node.arguments[index])
  ) {
    // find the index with properties
    const arg = node.arguments[index];
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
      if (index) {
        node.arguments.splice(index);
      } else {
        props.splice(index, 1);

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

// Recursively add the `openapi` meta object onto nested object properties.
export function attachOpenApiMeta(
  node,
  descriptionValue,
  exampleValues,
  importedIdents = new Set(),
  depth = 0,
) {
  if (t.isCallExpression(node)) {
    const callee = node.callee;
    const objectExample = generateObjectProps('example', exampleValues);
    const objProp = objectExample ? [objectExample] : [];
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

        // these arrays only exist in the output,
        // which doesn't need an example
        node.arguments[0] = replaceObjectPropertyLocation(
          innerArg,
          'description',
          [],
        );
      }

      // replace all the nested object descriptions too
      if (depth > 0) {
        return replaceObjectPropertyLocation(node, 'description', objProp);
      }

      return node;
    }

    // if already has a meta object, add example
    if (t.isMemberExpression(callee) && callee.property.name === 'openapi') {
      return node;
    }

    // leaf node
    return replaceObjectPropertyLocation(node, 'description', objProp);
  }

  return node;
}
