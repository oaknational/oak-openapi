import { OakColorToken } from '@oaknational/oak-components';
import Svg from './StyledSvg';

export default function Logo({
  width = '100%',
  height = '100%',
  fill = 'currentColor' as OakColorToken,
}) {
  return Svg({
    name: 'logo',
    width,
    height,
    fill,
  });
}
