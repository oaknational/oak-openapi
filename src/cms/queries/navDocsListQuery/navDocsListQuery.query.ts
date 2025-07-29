import client from '@/cms/client';
import { NavDocsListQuery } from './navDocsListQuery.schema';
import {
  type CurriculumApiDocsNav,
  curriculumApiDocsNavSchema,
  NavGroup,
} from '@/cms/schemaTypes/curriculumApiDocsNav.schema';
import query from './navDocsListQuery.gql';
import { groupedEndpointInfo } from '@/lib/endpoint-docs/getEndpointDocs';

const API_ENDPOINTS_SLUG = 'api-endpoints';

const getEndpointsNavData = () => {
  return Object.values(groupedEndpointInfo).map((page, order) => {
    const { title, slug }: { title: string; slug: string } = page;

    return {
      title: `${order + 1}. ${title}`,
      href: `${API_ENDPOINTS_SLUG}/${slug}`,
    };
  });
};

const navDocsListQuery = async () => {
  const res = await client.request(query);
  const { groups, pages } = res as NavDocsListQuery;

  if (!groups || !pages) {
    throw new Error(
      'Missing Sanity content for docs navigation, see navDocsListQuery.gql',
    );
  }

  const input = {
    groups,
    pages,
  };

  const result: CurriculumApiDocsNav = input.groups
    .map((group): NavGroup => {
      const groupSlug = group.slug.text;
      const pages = input.pages
        .filter((page) => page.parentGroup?.slug?.text === groupSlug)
        .map((page) => ({
          title: page.title,
          href: `${groupSlug}/${page.slug.text}`,
        }));

      if (groupSlug === API_ENDPOINTS_SLUG) {
        pages.push(...getEndpointsNavData());
      }

      return {
        title: group.title,
        pages,
      };
    })
    .filter((item) => item.pages.length > 0);

  return curriculumApiDocsNavSchema.parse(result);
};

export default navDocsListQuery;
