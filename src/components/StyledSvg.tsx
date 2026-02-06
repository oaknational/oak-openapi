import styled from 'styled-components';
import React from 'react';

import type { OakUiRoleToken } from '@oaknational/oak-components';

interface SvgProps {
  name: string;
  className?: string;
  width?: string;
  height?: string;
  fill?: OakUiRoleToken;
  color?: OakUiRoleToken;
  filter?: string;
}

const StyledSvg_ = styled.svg`
  transition: all 0.3s ease;
`;

export default function StyledSvg({
  name,
  ...props
}: SvgProps): React.ReactElement {
  return (
    <StyledSvg_
      aria-hidden={true}
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      {...props}
    >
      <use xlinkHref={`/images/sprite.svg#${name}`} />
    </StyledSvg_>
  );
}
