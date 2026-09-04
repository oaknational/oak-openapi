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
    // Turbopack's webpack-loader shim does not implement emitError.
    const message = `GraphQL syntax error: ${error.message}`;
    if (typeof this?.emitError === 'function') {
      this.emitError(new Error(message));
    } else {
      throw new Error(message);
    }
    return 'export default null;';
  }
}
