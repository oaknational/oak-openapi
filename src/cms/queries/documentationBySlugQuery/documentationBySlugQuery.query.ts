import client from '@/cms/client';
import { CurriculumAPIDocumentationPage } from '@/cms/schemaTypes';
import { documentationBySlugQuerySchema } from './documentationBySlugQuery.schema';
import query from './documentationBySlugQuery.gql';

const documentationBySlugQuery = async (
  navGroupSlug: string,
  docSlug: string,
) => {
  const res = await client.request(query, { navGroupSlug, docSlug });

  const { allCurriculumApiDocumentationPage } =
    res as CurriculumAPIDocumentationPage;

  if (!allCurriculumApiDocumentationPage) {
    throw new Error('No documentation found :O( ');
  }

  return documentationBySlugQuerySchema.parse(
    allCurriculumApiDocumentationPage,
  );
};

export default documentationBySlugQuery;
