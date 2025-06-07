import { GraphQLClient } from 'graphql-request';
import { projectId, dataset, sanityGraphqlApiSecret } from './env';

export const sanityConfig = {
  projectId,
  dataset,
  datasetTag: 'default',
  useCDN: true,
};

const getGraphqlEndpoint = (opts: {
  projectId: string;
  dataset: string;
  datasetTag: string;
  useCDN: boolean;
}): string => {
  const subdomain = opts.useCDN ? `apicdn` : `api`;

  const sanityUrl = `https://${opts.projectId}.${subdomain}.sanity.io/v1/graphql/${opts.dataset}/${opts.datasetTag}`;
  return sanityUrl;
};

const graphqlAPIUrl = getGraphqlEndpoint(sanityConfig);

export const client = new GraphQLClient(graphqlAPIUrl, {
  headers: {
    Authorization: `Bearer ${sanityGraphqlApiSecret}`,
  },
});

export default client;
