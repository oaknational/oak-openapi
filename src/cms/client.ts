import { GraphQLClient } from 'graphql-request';
import { createClient } from 'next-sanity';
import getServerConfig from '@/node-lib/serverConfig';

const projectId = getServerConfig('sanityProjectId');
const dataset = getServerConfig('sanityDataset');
const token = getServerConfig('sanityGraphqlApiSecret');

export const sanityConfig = {
  projectId,
  dataset,
  datasetTag: 'default',
  useCDN: false,
};

export const sanityClient = createClient({
  projectId,
  dataset,
  token,
  useCdn: true,
  apiVersion: '2025-07-06', // should be hardcoded to a specific date
});

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
