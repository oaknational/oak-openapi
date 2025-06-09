import { gql } from 'graphql-request';
import client from '~/cms/client';

import { CurriculumAPIDocumentationPage } from '~/cms/schemaTypes';

import { documentationBySlugQuerySchema } from './documentationBySlugQuery.schema';

const query = gql`
  # Write your query or mutation here
  query getDocsBySlug($navGroupSlug: String, $docSlug: String) {
    allCurriculumApiDocumentationPage(
      where: {
        navGroupType: { slug: { current: { eq: $navGroupSlug } } }
        slug: { current: { eq: $docSlug } }
      }
    ) {
      title
      slug {
        text: current
      }
      navGroupType {
        slug {
          text: current
        }
        name
      }
      contentRaw
    }
  }
`;

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
