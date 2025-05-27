import { OakSecondaryLink } from '@oaknational/oak-components';
import styled from 'styled-components';

export const StrongLinkNoUnderline = styled(OakSecondaryLink)`
  text-decoration: none;
  font-weight: 600;
  display: flex;

  &:hover {
    text-decoration: underline;
  }

  &:visited {
    color: inherit;
  }
`;
