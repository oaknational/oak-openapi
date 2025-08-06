// I'm not sure why, but all the API designs use bullets in their
// ULs but it's not used in the design system, so we'll put them back.

import { OakUL } from '@oaknational/oak-components';
import styled from 'styled-components';

export const UL = styled(OakUL)`
  list-style-type: disc;
  margin: 1em 0;
  padding-left: 1.5rem;

  li {
    display: list-item;
  }
`;
