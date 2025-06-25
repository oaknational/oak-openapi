import { gql } from 'graphql-request';
import client from '@/cms/client';

// import { CurriculumAPIDocumentationPage } from '@/cms/schemaTypes';

import {
  NavDocsListGroup,
  NavDocsListPage,
  NavDocsListQuery,
  //   navDocsListQuerySchema,
} from './navDocsListQuery.schema';
import { curriculumApiDocsNavSchema } from '@/cms/schemaTypes/curriculumApiDocsNav.schema';
import { NavItems } from '@/cms/schemaTypes/shared/components/NavItems.schema';

const query = gql`
  query getAllDocsNavGroups {
    groups: allNavGroup {
      title: name
      slug {
        text: current
      }
    }
    pages: allCurriculumApiDocumentationPage {
      title
      slug {
        text: current
      }
      parentGroup: navGroupType {
        slug {
          text: current
        }
      }
    }
  }
`;

const navDocsListQuery = async () => {
  const res = await client.request(query);
  const { groups, pages } = res as NavDocsListQuery;

  if (!groups || !pages) {
    throw new Error('No documentation found :O( ');
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
