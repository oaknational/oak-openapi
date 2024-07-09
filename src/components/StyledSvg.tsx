import { FC } from 'react';
import styled from 'styled-components';

import {
  OakBox,
  OakBoxProps,
  OakColorToken,
} from '@oaknational/oak-components';

const StyledSvg = styled.svg<OakBoxProps>`
  ${OakBox};
  transition: all 0.3s ease;
`;
export type SvgProps = OakBoxProps & {
  name: string;
  className?: string;
  width?: string;
  height?: string;
  fill?: OakColorToken;
  color?: OakColorToken;
  filter?: string;
};
const Svg: FC<SvgProps> = (props) => {
  return (
    <StyledSvg
      aria-hidden={true}
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      {...props}>
      <use xlinkHref={`/images/sprite.svg#${props.name}`} />
    </StyledSvg>
  );
};

export default Svg;
