/** @jsxImportSource theme-ui */

import bootstrapSvg from 'bootstrap-icons/bootstrap-icons.svg';
import { ThemeUICSSObject } from 'theme-ui';

export type IconsProps = {
  name: string;
  sx?: ThemeUICSSObject;
};

export function Icons(props: IconsProps) {
  const { name, sx, ...svgProps } = props;

  return (
    <svg className="bi" width="24" height="24" fill="currentColor" sx={sx} {...svgProps}>
      <use xlinkHref={`${bootstrapSvg}#${name}`} />
    </svg>
  );
}
