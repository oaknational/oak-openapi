import type { EndpointInfo } from '@/components/documentationPages/EndpointBlock';
import type {
  ZodOpenApiOperationObject,
  ZodOpenApiPathsObject,
  ZodOpenApiResponsesObject,
} from 'zod-openapi';
import { openApiDocument } from '@/lib/zod-openapi/schema/generateDocument';
import type {
  SchemaObject,
  ParameterObject,
  ReferenceObject,
} from 'openapi3-ts/oas31';
import { findAllObjectProperties, getPathEnd } from './helpers';

export const groupedEndpointInfo = [
  {
    title: 'Lists',
    slug: 'lists',
    tags: ['lists'],
    order: 1,
  },
  {
    title: 'Lesson data',
    slug: 'lesson-data',
    tags: ['lesson-data'],
    order: 2,
  },
  {
    title: 'Unit and curriculum data',
    slug: 'unit-and-curriculum-data',
    tags: ['unit-and-curriculum-data'],
    order: 3,
  },
  {
    title: 'Quiz questions',
    slug: 'quiz-questions',
    tags: ['questions'],
    order: 4,
  },
  {
    title: 'Search',
    slug: 'search',
    tags: ['search'],
    order: 5,
  },
  {
    title: 'Sequence data',
    slug: 'sequence-data',
    tags: ['sequences'],
    order: 6,
  },
  {
    title: 'Programme data',
    slug: 'programme-data',
    tags: ['programmes'],
    order: 6,
  },
];

// RS: I don't honestly understand this return type, but it's a new TS ruleset
// so this passes and it always worked previously.
const getSchemaFromResponse = (
  responses: ZodOpenApiResponsesObject,
): (never[] | undefined | SchemaObject | ReferenceObject)[] => {
  return Object.values(responses).map((response) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const schemaRef = response.content['application/json'].schema
      .$ref as string;

    if (!schemaRef) {
      return [];
    }

    const schemaName = getPathEnd(schemaRef);

    if (openApiDocument.components?.schemas) {
      const schema = openApiDocument.components?.schemas[schemaName];
      if (!schema) {
        return [];
      }
      return schema;
    }
  });
};

const getParamType = (properties: SchemaObject): string | undefined => {
  if (properties.anyOf && properties.anyOf.length) {
    const anyOf = properties.anyOf as SchemaObject[];
    return anyOf.map((prop) => prop.type).join(', ');
  }
  const schemaType = 'array' as const;

  if (properties.type !== undefined) {
    if (properties.items && properties.type === schemaType) {
      return `array[${getParamType(properties.items as SchemaObject) ?? 'object'}]`;
    }
    return properties.type as string;
  }
};

interface OutputSchema {
  name: string;
  type: string;
  description: string;
}

const getOutputSchema = (
  responses: ZodOpenApiResponsesObject,
): OutputSchema[][] => {
  if (!responses) {
    return [];
  }
  return Object.values(responses)
    .map((response) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const schemaRef = response.content['application/json'].schema
        .$ref as string;

      if (!schemaRef) {
        return [];
      }

      const schemaName = getPathEnd(schemaRef);

      if (openApiDocument.components?.schemas) {
        const schema = openApiDocument.components?.schemas[schemaName];
        // find all nested properties with descriptions
        const data = findAllObjectProperties(
          schema,
          'description',
          ['example'],
          ['properties'],
        ) as Record<string, SchemaObject>;

        if (schema && data) {
          const output = Object.keys(data).map((propertyName) => {
            const property = data[propertyName];
            return {
              name: propertyName,
              type: getParamType(property) || '',
              description: property.description || '',
            };
          });
          return output;
        }
      }
    })
    .filter((res) => res !== undefined);
};

export const getEndpointContent = (
  paramSlug: string,
): { endpoints: EndpointInfo[] | []; title: string } | undefined => {
  const endpointMeta = groupedEndpointInfo.find(
    ({ slug }: { slug: string }) => slug === paramSlug,
  );

  const tags = endpointMeta?.tags;

  if (!tags) {
    return;
  }

  const data = openApiDocument;
  const pathsData = data.paths as ZodOpenApiPathsObject;

  const endpointsWithPath = Object.keys(pathsData).map((path) => ({
    data: pathsData[path],
    path,
  }));
  // only use get requests for now
  const filteredEndpoints = endpointsWithPath.filter((endpoint) =>
    endpoint.data.get?.tags?.some((tag: string) => tags.indexOf(tag) !== -1),
  );

  const endpoints: EndpointInfo[] = filteredEndpoints.map((endpoint, order) => {
    const { path, data } = endpoint;

    const summary = endpoint.data.get?.summary;

    const endpointSlug =
      summary?.replaceAll(' ', '-').toLocaleLowerCase() ?? getPathEnd(path);

    const { description, responses, parameters } =
      data.get as ZodOpenApiOperationObject;

    const params = parameters as ParameterObject[];
    const schemas = getSchemaFromResponse(responses) as SchemaObject[];
    const output = getOutputSchema(responses).flat();
    const paramTypes =
      params?.reduce(
        (acc, param) => acc.add(param.in as string),
        new Set<string>(),
      ) || [];

    return {
      order: order + 1,
      title: `${endpointMeta.order}.${order + 1} ${summary}`,
      requestType: 'GET',
      path,
      description,
      paramTypes: [...paramTypes],
      params: params?.map((param) => {
        const schema = param.schema as SchemaObject;
        return {
          name: `${param.name}${!param.required ? ' [optional]' : ''}`,
          type: schema.type as string,
          description: param.description || schema.description,
          example: (schema.example as string) || '',
        };
      }),
      output,
      sampleResponse: schemas.length
        ? JSON.stringify(schemas[0]?.example, null, 2)
        : '',
      slug: endpointSlug,
    };
  });

  return {
    endpoints,
    title: groupedEndpointInfo.find((group) => group.slug === paramSlug)
      ?.title as string,
  };
};
