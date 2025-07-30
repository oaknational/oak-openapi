import * as t from '@babel/types';


const hasObjectProperty = (node, property) =>  
    t.isCallExpression(node) &&
    t.isMemberExpression(node.callee) &&
    node.callee.property.name === property &&
    node.arguments.length > 0 &&
    t.isObjectExpression(node.arguments[0])

const findObjectProperty = (node, property) => {
    if (hasObjectProperty(node, property)) {
        
    for (const prop of objectExpr.properties) {
            if (
                t.isObjectProperty(prop) &&
                t.isIdentifier(prop.key, { name: property })
                ) {
                    return prop;
                }
            }
        }

    return null
}

function hasDescription(node) {
  // Case 1: description in Zod constructor args, e.g., z.string({ description: '...' })
  if (
    t.isCallExpression(node) &&
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

  // Case 2: description in openapi metadata call
  if (
    hasObjectProperty(node, 'openapi') &&
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


function normalizeZodDescription(node, descriptionValue) {
  // Case: z.string({ description: '...' }) — extract and move description to openapi()
  const described = hasDescription(node);


  if (
    t.isCallExpression(node) &&
    node.arguments.length > 0 &&
    t.isObjectExpression(node.arguments[0]) && 
    described
  ) {
    const arg = node.arguments[0]
    const props = arg.properties;
    
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
        node.arguments = [];
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
  // Case: no description at all — return undefined 
    if(!described && descriptionValue) {
        return t.callExpression(
                t.memberExpression(node, t.identifier('openapi')),
                [
                    t.objectExpression([
                    t.objectProperty(
                        t.identifier('description'),
                        t.valueToNode(descriptionValue),
                    ),
                    ]),
                ],
            );
        }

   return node
}


// Recursively add the `openapi` meta object onto nested object properties.
// This is only really needed for Response objects.
export function attachDescriptions(node, descriptionValue, exampleValues, importedIdents = new Set()) {
  if (t.isCallExpression(node)) {
    const callee = node.callee;

    // for nested objects
        if (t.isMemberExpression(callee) && callee.property.name === 'object') {

            const arg = node.arguments[0];
            const properties = arg.properties
            if (t.isObjectExpression(arg) && properties && properties.length)  {
                properties.forEach((prop) => {
                    
                    if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
                        
                        prop.value = attachDescriptions(
                            prop.value,
                            descriptionValue?.[prop.key.name],
                            exampleValues?.[prop.key.name],
                            importedIdents,
                        );
                        //  console.log(prop.value, prop.key.name)
                        //  console.log(10* "----")
                    }
                });
            }
            return node
        }

        if (t.isMemberExpression(callee) && callee.property.name === 'array') {
            const innerArg = node.arguments[0];

            if(innerArg) {
                node.arguments[0] = attachDescriptions(innerArg, descriptionValue, exampleValues, importedIdents);
            }
            return node
        }


        // if already has a meta object, ignore
        if (t.isMemberExpression(callee) && callee.property.name === 'openapi') {
            return node;
        }

        // leaf nodes
        // console.log(node)
        // if( descriptionValue && descriptionValue.description ) {
        const description = descriptionValue && descriptionValue.description ? descriptionValue.description : undefined;
        const normalised = normalizeZodDescription(node, description);
            // if(exampleValues) {
            //     console.log(exampleValues)
            // }
        //     return normalised
        // }

        return normalised;
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