import { OakColorToken } from '@oaknational/oak-components';
import Svg from './StyledSvg';

export default function Logo({
  width = '100%',
  height = '100%',
  fill = 'currentColor' as OakColorToken,
  name = 'logo',
}) {
  return Svg({
    name,
    width,
    height,
    fill,
  });
}
