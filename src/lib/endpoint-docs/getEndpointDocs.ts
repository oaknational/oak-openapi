import { EndpointInfo } from '@/components/documentationPages/EndpointBlock';
import { openApiDocument } from '@/lib/zod-openapi/schema/generateDocument';
import {
  ZodOpenApiOperationObject,
  ZodOpenApiPathItemObject,
  ZodOpenApiPathsObject,
  ZodOpenApiResponsesObject,
} from 'zod-openapi';
import { SchemaObject } from 'zod-openapi/dist/extendZodTypes';
import { SchemaObjectType } from 'zod-openapi/dist/openapi3-ts/dist/oas31';
import { ParameterObject } from 'zod-openapi/dist/openapi3-ts/dist/oas31';
import { findObjectProperty, getPathEnd, slugToTitle } from './helpers';

export const groupedEndpointInfo = [
  {
    title: 'Lists',
    slug: 'lists',
    tags: ['lists'],
  },
  {
    title: 'Lesson data',
    slug: 'lesson-data',
    tags: ['lessons'],
  },
  {
    title: 'Unit and curriculum data',
    slug: 'unit-and-curriculum-data',
    tags: ['units', 'sequences'],
  },
  {
    title: 'Quiz questions',
    slug: 'quiz-questions',
    tags: ['questions'],
  },
  {
    title: 'Search',
    slug: 'search',
    tags: ['search'],
  },
];

const getSchemaFromResponse = (responses: ZodOpenApiResponsesObject) => {
  return Object.values(responses).map((response) => {
    const schemaRef = response.content['application/json'].schema.$ref;

    if (!schemaRef) return [];

    const schemaName = getPathEnd(schemaRef);

    if (openApiDocument.components?.schemas) {
      const schema = openApiDocument.components?.schemas[schemaName];
      return schema;
    }
  });
};

const getParamType = (properties: SchemaObject): string | undefined => {
  if (properties.anyOf && properties.anyOf.length) {
    const anyOf = properties.anyOf as SchemaObject[];
    return anyOf.map((prop) => prop.type).join(', ');
  }
  const schemaType = 'array' as SchemaObjectType;

  if (properties.type !== undefined) {
    if (properties.items && properties.type === schemaType) {
      return `array[${getParamType(properties.items as SchemaObject)}]`;
    }
    return properties.type as string;
  }
};

const getOutputSchema = (responses: ZodOpenApiResponsesObject) => {
  if (!responses) {
    return [];
  }
  return Object.values(responses)
    .map((response) => {
      const schemaRef = response.content['application/json'].schema.$ref;

      if (!schemaRef) return [];

      const schemaName = getPathEnd(schemaRef);

      if (openApiDocument.components?.schemas) {
        const schema = openApiDocument.components?.schemas[schemaName];
        const data = findObjectProperty(schema, 'properties');
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

export const getEndpointContent = async (
  paramSlug: string,
): Promise<{ endpoints: EndpointInfo[] | []; title: string } | undefined> => {
  const tags = groupedEndpointInfo.find(
    ({ slug }: { slug: string }) => slug === paramSlug,
  )?.tags;

  if (!tags) return;

  const data = openApiDocument;
  const pathsData = data.paths as ZodOpenApiPathsObject;

  const endpointsWithPath = Object.keys(pathsData).map((path) => ({
    data: pathsData[path] as ZodOpenApiPathItemObject,
    path,
  }));
  // only use get reqs for now
  const filteredEndpoints = endpointsWithPath.filter((endpoint) =>
    endpoint.data.get?.tags?.some((tag: string) => tags.indexOf(tag) !== -1),
  );

  const endpoints: EndpointInfo[] = filteredEndpoints.map((endpoint, order) => {
    const { path, data } = endpoint;
    const endpointSlug = getPathEnd(path);

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
      title: `${order + 1}. ${slugToTitle(getPathEnd(path))}`,
      requestType: 'GET',
      path,
      description,
      paramTypes: [...paramTypes],
      params: params?.map((param) => {
        const schema = param.schema as SchemaObject;
        return {
          name: `${param.name}${!param.required ? ' [optional]' : ''}`,
          type: (schema.type as string) || '',
          description: param.description || '',
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
