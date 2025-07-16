// import { gql } from 'graphql-request';
import client from '@/cms/client';
import { CurriculumApiLandingPage } from '@/cms/schemaTypes';
import query from './landingPageQuery.gql';

type CurriculumApiLandingPageQueryResponse = {
  allCurriculumApiLandingPage: CurriculumApiLandingPage;
};

const documentationQuery = async () => {
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
