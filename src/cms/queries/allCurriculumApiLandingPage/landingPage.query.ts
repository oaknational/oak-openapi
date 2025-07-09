import { gql } from 'graphql-request';
import client from '@/cms/client';

import { CurriculumApiLandingPage } from '@/cms/schemaTypes';

const query = gql`
  query {
    allCurriculumApiLandingPage {
      heroBlock {
        body
        titlePortableTextRaw
        image {
          isPresentational
          asset {
            _id
            url
          }
        }
      }
      content {
        textAndMedia {
          title
          bodyRaw
          image {
            isPresentational
            asset {
              _id
              url
            }
          }
          alignMedia
        }
      }
      usingTheApiSection {
        mainBlock {
          title
          buttonLink {
            external
          }
          image {
            isPresentational
            asset {
              _id
              url
            }
          }
        }
        siblingBlocks {
          title
          buttonLink {
            external
          }
          body
        }
      }
    }
  }
`;

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
