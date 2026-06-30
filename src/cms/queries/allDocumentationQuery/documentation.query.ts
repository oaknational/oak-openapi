import client from '@/cms/client';
import type { CurriculumAPIDocumentationPage } from '@/cms/schemaTypes';
import {
  documentationQuerySchema,
  type DocumentationQuery,
} from './documentationQuery.schema';
import query from './documentationQuery.gql';

const documentationQuery = async (): Promise<DocumentationQuery> => {
  const res: CurriculumAPIDocumentationPage = await client.request(query);

  const { allApiContentPage } = res;

  if (!allApiContentPage) {
    throw new Error(
      'Missing Sanity content for documentation, see documentationQuery.gql',
    );
  }

  return documentationQuerySchema.parse(allApiContentPage);
};

export default documentationQuery;
