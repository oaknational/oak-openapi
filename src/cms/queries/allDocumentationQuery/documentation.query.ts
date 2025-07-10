import client from '@/cms/client';
import { CurriculumAPIDocumentationPage } from '@/cms/schemaTypes';
import { documentationQuerySchema } from './documentationQuery.schema';
import query from './documentationQuery.gql';

const documentationQuery = async () => {
  const res = await client.request(query);

  const { allApiContentPage } = res as CurriculumAPIDocumentationPage;

  if (!allApiContentPage) {
    throw new Error('No documentation found :O( ');
  }

  return documentationQuerySchema.parse(allApiContentPage);
};

export default documentationQuery;
