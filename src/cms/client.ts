import { GraphQLClient } from 'graphql-request';
import getServerConfig from '~/node-lib/serverConfig';

const projectId = getServerConfig('sanityProjectId');
const dataset = getServerConfig('sanityDataset');
const token = getServerConfig('sanityGraphqlApiSecret');

export const sanityConfig = {
  projectId,
  dataset,
  datasetTag: 'default',
  useCDN: false,
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
    Authorization: `Bearer ${token}`,
  },
});

export default client;
