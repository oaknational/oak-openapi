import type { OakUiRoleToken } from '@oaknational/oak-components';
import Svg from './StyledSvg';

interface LogoProps {
  width?: string;
  height?: string;
  fill?: OakUiRoleToken;
  name?: string;
}

export default function Logo({
  width = '100%',
  height = '100%',
  fill = 'currentColor' as OakUiRoleToken,
  name = 'logo',
}: LogoProps): React.ReactElement {
  return Svg({
    name,
    width,
    height,
    fill,
  });
}
