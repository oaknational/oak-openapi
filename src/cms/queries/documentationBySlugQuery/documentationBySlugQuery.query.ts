import client from '@/cms/client';
import { CurriculumAPIDocumentationPage } from '@/cms/schemaTypes';
import query from './documentationBySlugQuery.gql';

const documentationBySlugQuery = async (
  navGroupSlug: string,
  docSlug: string,
) => {
  const res = (await client.request(query, {
    navGroupSlug,
    docSlug,
  })) as CurriculumAPIDocumentationPage;

  const { allApiContentPage } = res;

  if (!allApiContentPage) {
    throw new Error(
      'Missing Sanity content for documentation by slug, see documentationBySlugQuery.gql',
    );
  }

  return allApiContentPage;
};

export default documentationBySlugQuery;
