import { sanityClient } from '@/cms/client';

const query = `*[
  _type=="apiContentPage" &&
  slug.current == $docSlug &&
  navGroupType->slug.current == $navGroupSlug
]{
  navGroupType->,
  slug,
  title,
  docsBlocks[]{
    ...,
    _type == "image" => {
      ...,
      asset->{ url, metadata{ dimensions{ width, height } } }
    },
    _type == "ctaLink" => {
      ...,
      backgroundImageUrl{
        ...,
        asset->{ url, metadata{ dimensions{ width, height } } }
      }
    }
  }
}`;

const documentationBySlugQuery = async (
  navGroupSlug: string,
  docSlug: string,
) => {
  const allApiContentPage = await sanityClient.fetch(query, {
    docSlug,
    navGroupSlug,
  });

  if (!allApiContentPage) {
    throw new Error(
      'Missing Sanity content for documentation by slug, see documentationBySlugQuery.gql',
    );
  }

  return allApiContentPage;
};

export default documentationBySlugQuery;
