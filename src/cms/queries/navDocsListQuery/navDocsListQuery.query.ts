import client from '@/cms/client';
import {
  NavDocsListGroup,
  NavDocsListPage,
  NavDocsListQuery,
  //   navDocsListQuerySchema,
} from './navDocsListQuery.schema';
import { curriculumApiDocsNavSchema } from '@/cms/schemaTypes/curriculumApiDocsNav.schema';
import { NavItems } from '@/cms/schemaTypes/shared/components/NavItems.schema';
import query from './navDocsListQuery.gql';

const navDocsListQuery = async () => {
  const res = await client.request(query);
  const { groups, pages } = res as NavDocsListQuery;

  if (!groups || !pages) {
    throw new Error(
      'Missing Sanity content for docs navigation, see navDocsListQuery.gql',
    );
  }

  const docsList = groups.map(({ title, slug }: NavDocsListGroup) => {
    return {
      title,
      slug: slug.text,
      children: pages
        .filter(
          ({ parentGroup }: NavDocsListPage) =>
            parentGroup.slug.text === slug.text,
        )
        .map((page: NavDocsListPage) => {
          return { title: page.title, slug: page.slug.text };
        }),
    };
  });

  const docsNavList = groups.map(({ title, slug }) => {
    const groupSlug = slug.text;
    return [
      {
        title,
        href: `/${groupSlug}`,
      },
      ...pages
        .filter(
          ({ parentGroup }: NavDocsListPage) =>
            parentGroup.slug.text === groupSlug,
        )
        .map((page: NavDocsListPage) => {
          return {
            title: page.title,
            href: `/${groupSlug}/${page.slug.text}`,
          };
        }),
    ];
  });

  const docsNavItems: NavItems = docsNavList.flat();

  return curriculumApiDocsNavSchema.parse({
    nestedData: docsList,
    items: docsNavItems,
  });
};

export default navDocsListQuery;
