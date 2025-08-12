import { EndpointInfo } from '@/components/documentationPages/EndpointDocsContent';
import { openApiDocument } from '@/lib/zod-openapi/schema/generateDocument';
import {
  ZodOpenApiOperationObject,
  ZodOpenApiPathItemObject,
  ZodOpenApiPathsObject,
  ZodOpenApiResponsesObject,
} from 'zod-openapi';

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
    slug: 'unit-curriculum-data',
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

export function slugToTitle(str: string) {
  return str
    .split('-')
    .reduce((acc, str) => acc + str[0].toUpperCase() + str.slice(1) + ' ', '');
}

const getPathEnd = (path: string) => {
  const pathSlugs = path.split('/');
  return pathSlugs[pathSlugs.length - 1];
};

const dig = (obj: Record<string, any>, target: string) =>
  target in obj
    ? obj[target]
    : Object.values(obj).reduce((acc, val) => {
        if (acc !== undefined) return acc;
        if (typeof val === 'object') return dig(val, target);
      }, undefined);

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

const getParamType = (properties): string => {
  if (properties.anyOf) {
    return properties.anyOf.map((prop) => prop.type).join(', ');
  }
  if (properties.items && properties.type === 'array') {
    return `array[${getParamType(properties.items)}]`;
  }
  return properties.type;
};

const getOutputSchema = (responses: ZodOpenApiResponsesObject) => {
  return Object.values(responses).map((response) => {
    const schemaRef = response.content['application/json'].schema.$ref;

    if (!schemaRef) return [];

    const schemaName = getPathEnd(schemaRef);

    if (openApiDocument.components?.schemas) {
      const schema = openApiDocument.components?.schemas[schemaName];
      const data = dig(schema, 'properties');
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
  });
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
    // const requestTypes = Object.keys(pathData);
    const endpointSlug = getPathEnd(path);

    const { description, parameters, responses } =
      data.get as ZodOpenApiOperationObject;

    const schemas = getSchemaFromResponse(responses);
    const output = getOutputSchema(responses).flat();
    const paramTypes =
      parameters?.reduce((acc, param) => acc.add(param.in), new Set()) || [];

    return {
      order: order + 1,
      title: `${order + 1}. ${slugToTitle(getPathEnd(path))}`,
      requestType: 'GET',
      path,
      description,
      paramTypes: [...paramTypes],
      params: parameters?.map((param) => ({
        name: `${param.name}${!param.required ? ' [optional]' : ''}`,
        type: param.schema.type || '',
        description: param.description || '',
        example: param.schema.example || '',
      })),
      output: output ? output : [],
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

// const generateEndpointData = () => {};
