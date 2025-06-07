import { createClient } from 'next-sanity';
import getServerConfig from '~/node-lib/serverConfig';

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-05-15';

const projectId = getServerConfig('sanityProjectId');
const dataset = getServerConfig('sanityDataset');
const token = getServerConfig('sanityGraphqlApiSecret');

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion,
  useCdn: false, // Set to false if statically generating pages, using ISR or tag-based revalidation
});

export default client;
