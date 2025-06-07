export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-05-15';

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET',
);

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID',
);

export const sanityGraphqlApiSecret = assertValue(
  process.env.SANITY_AUTH_SECRET,
  'Missing environment variable: SANITY_AUTH_SECRET',
);

export const sanityAssetCDNHost = assertValue(
  process.env.NEXT_PUBLIC_SANITY_ASSET_CDN_HOST,
  'Missing environment variable: NEXT_PUBLIC_SANITY_ASSET_CDN_HOST',
);

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage);
  }

  return v;
}
