import * as t from '@babel/types';

function getPropertyName(property) {
  return t.isIdentifier(property) || t.isStringLiteral(property)
    ? (property.name ?? property.value)
    : undefined;
}

function upsertObjectProperty(objectExpression, key, value) {
  const existingProperty = objectExpression.properties.find(
    (property) =>
      t.isObjectProperty(property) && getPropertyName(property.key) === key,
  );

  if (existingProperty && t.isObjectProperty(existingProperty)) {
    existingProperty.value = value;
    return;
  }

  objectExpression.properties.push(t.objectProperty(t.identifier(key), value));
}

export function addOpenApiObject(node, properties) {
  const metadataProperties = properties.map((property) => ({
    key: property.key,
    value: t.isNode(property.value)
      ? property.value
      : t.valueToNode(property.value),
  }));

  if (
    t.isCallExpression(node) &&
    t.isMemberExpression(node.callee) &&
    getPropertyName(node.callee.property) === 'meta' &&
    t.isObjectExpression(node.arguments[0])
  ) {
    for (const property of metadataProperties) {
      upsertObjectProperty(node.arguments[0], property.key, property.value);
    }
    return node;
  }

  const objectProperties = metadataProperties.map((property) =>
    t.objectProperty(t.identifier(property.key), property.value),
  );

  return t.callExpression(t.memberExpression(node, t.identifier('meta')), [
    t.objectExpression(objectProperties),
  ]);
}

export const generateObjectProps = (key, value) => ({ key, value });

function attachNestedExamples(node, exampleValue, depth) {
  if (!t.isCallExpression(node) || !t.isMemberExpression(node.callee)) {
    return;
  }

  const methodName = getPropertyName(node.callee.property);

  if (methodName === 'object') {
    const shape = node.arguments[0];
    if (!t.isObjectExpression(shape)) return;

    for (const property of shape.properties) {
      if (!t.isObjectProperty(property)) continue;
      const propertyName = getPropertyName(property.key);
      if (!propertyName) continue;

      property.value = attachOpenApiMeta(
        property.value,
        undefined,
        exampleValue?.[propertyName],
        undefined,
        depth + 1,
      );
    }
    return;
  }

  if (methodName === 'array') {
    const itemSchema = node.arguments[0];
    if (itemSchema) {
      attachNestedExamples(itemSchema, exampleValue?.[0], depth);
    }
    return;
  }

  attachNestedExamples(node.callee.object, exampleValue, depth);
}

export function attachOpenApiMeta(
  node,
  _descriptionValue,
  exampleValue,
  _importedIdents,
  depth = 0,
) {
  attachNestedExamples(node, exampleValue, depth);

  if (depth > 0 && exampleValue !== undefined) {
    return addOpenApiObject(node, [
      generateObjectProps('example', exampleValue),
    ]);
  }

  return node;
}
