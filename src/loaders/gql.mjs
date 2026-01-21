import { parse } from 'graphql';

export default function (source) {
  try {
    // Parse the GraphQL query
    parse(source);

    // You can add custom processing here
    // For example, validation, transformation, etc.

    // Return the parsed document as a module
    return `
      import { parse } from 'graphql';
      const doc = parse(${JSON.stringify(source)});
      export default doc;
    `;
  } catch (error) {
    this.emitError(new Error(`GraphQL syntax error: ${error.message}`));
    return 'export default null;';
  }
}
