import type { StructureResolver } from 'sanity/structure';

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.listItem()
    .title('Curriculum API Documentation')
    .child(
      S.list()
        .title('Curriculum API Documentation')
        .items([
          S.listItem()
            .title('Curriculum API landing page')
            .child(S.documentTypeList('curriculumApiLandingPage')),
          S.listItem()
            .title('Documentation')
            .child(
              S.documentTypeList('navGroup')
                .title('Documentation by navigation group')
                .child((navGroupId: string) =>
                  S.documentList()
                    .title('Docs')
                    .filter(
                      '_type == "curriculumApiDocumentationPage" && $navGroupId == navGroupType._ref',
                    )
                    .params({ navGroupId }),
                ),
            ),
          S.listItem()
            .title('All plain text pages')
            .child(S.documentTypeList('curriculumApiDocumentationPage')),
          S.listItem()
            .title('Navigation groups')
            .child(S.documentTypeList('navGroup')),
        ]),
    );
