import client from '@/cms/client';
import { NavDocsListQuery } from './navDocsListQuery.schema';
import {
  type CurriculumApiDocsNav,
  curriculumApiDocsNavSchema,
  NavGroup,
} from '@/cms/schemaTypes/curriculumApiDocsNav.schema';
import query from './navDocsListQuery.gql';

const navDocsListQuery = async () => {
  const res = await client.request(query);
  const { groups, pages } = res as NavDocsListQuery;

  if (!groups || !pages) {
    throw new Error('No documentation found :O( ');
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
      return {
        title: group.title,
        pages,
      };
    })
    .filter((item) => item.pages.length > 0);

  return curriculumApiDocsNavSchema.parse(result);
};

export default navDocsListQuery;
