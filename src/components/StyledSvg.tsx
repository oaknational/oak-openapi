import styled from 'styled-components';

import {
  OakBox,
  OakBoxProps,
  OakColorToken,
} from '@oaknational/oak-components';

type SvgProps = OakBoxProps & {
  name: string;
  className?: string;
  width?: string;
  height?: string;
  fill?: OakColorToken;
  color?: OakColorToken;
  filter?: string;
};

const StyledSvg_ = styled.svg<OakBoxProps>`
  ${OakBox};
  transition: all 0.3s ease;
`;

export default function StyledSvg({ name, ...props }: SvgProps) {
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
