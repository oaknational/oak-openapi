import createImageUrlBuilder from '@sanity/image-url';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import getServerConfig from '~/node-lib/serverConfig';

const projectId = getServerConfig('sanityProjectId');
const dataset = getServerConfig('sanityDataset');

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({ projectId, dataset });

export const urlFor = (source: SanityImageSource) => {
  return builder.image(source);
};
