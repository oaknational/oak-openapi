'use client';

import { OakBox, OakLink } from '@oaknational/oak-components';
import styled from 'styled-components';
import type { AdminUser } from '@/app/api/admin/schemas';
import { EMPTY } from './format';

// A real <table> rather than OakFlex rows: this is genuinely tabular data and
// the semantics matter for screen readers. The design system has no table
// component, so this borrows the same Oak tokens as src/components/Table.tsx
// rather than generalising that one, which is a Sanity portable-text renderer
// that markdown-renders every cell.
const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: var(--Border-Radius-border-radius-m2, 8px);
  border: 1px solid var(--Tokens-Border-border-decorative1-stronger, #93e892);
  overflow: hidden;

  th,
  td {
    text-align: left;
    padding: 12px;
    vertical-align: top;
    line-height: 1.5;
    white-space: nowrap;
  }

  th {
    font-weight: bold;
    background: var(--Tokens-Background-bg-decorative1-main, #bef2bd);
  }

  tr:nth-child(even) {
    background: var(--Tokens-Background-bg-decorative1-very-subdued, #ebfbeb);
  }
`;

const Scroller = styled(OakBox)`
  overflow-x: auto;
`;

const KeyCell = styled.span`
  font-family: monospace;
`;

export function UserTable({
  users,
}: {
  users: AdminUser[];
}): React.ReactElement {
  return (
    <Scroller>
      <Table>
        <thead>
          <tr>
            {['ID', 'Name', 'Company', 'Email', 'API key'].map((heading) => (
              <th key={heading} scope="col">
                <OakBox $font={['body-3', 'body-2']}>{heading}</OakBox>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.key}>
              <td>
                <OakBox $font={['body-3', 'body-2']}>
                  <OakLink href={`/admin/users/${user.id}`}>{user.id}</OakLink>
                </OakBox>
              </td>
              <td>
                <OakBox $font={['body-3', 'body-2']}>
                  {user.name ?? EMPTY}
                </OakBox>
              </td>
              <td>
                <OakBox $font={['body-3', 'body-2']}>
                  {user.company ?? EMPTY}
                </OakBox>
              </td>
              <td>
                <OakBox $font={['body-3', 'body-2']}>
                  {user.email ?? EMPTY}
                </OakBox>
              </td>
              <td>
                <OakBox
                  $font={['body-3', 'body-2']}
                  $display="flex"
                  $alignItems="center"
                  $gap="spacing-8"
                >
                  <KeyCell>{user.key}</KeyCell>
                </OakBox>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Scroller>
  );
}
