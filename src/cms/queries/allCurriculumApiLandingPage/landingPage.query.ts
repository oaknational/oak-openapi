import client from '@/cms/client';
import type { CurriculumApiLandingPage } from '@/cms/schemaTypes';
import query from './landingPageQuery.gql';

interface CurriculumApiLandingPageQueryResponse {
  allCurriculumApiLandingPage: CurriculumApiLandingPage;
}

const documentationQuery = async (): Promise<CurriculumApiLandingPage> => {
  const res = await client.request(query);

  const { allCurriculumApiLandingPage } =
    res as CurriculumApiLandingPageQueryResponse;

  if (!allCurriculumApiLandingPage) {
    throw new Error(
      'Missing Sanity content for documentation landing page, see landingPageQuery.gql',
    );
  }

  return allCurriculumApiLandingPage;
};

export default documentationQuery;
