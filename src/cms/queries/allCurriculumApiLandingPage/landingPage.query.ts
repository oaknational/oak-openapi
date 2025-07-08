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
    throw new Error('No documentation found :O( ');
  }

  return allCurriculumApiLandingPage;
};

export default documentationQuery;
