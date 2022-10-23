import { IconButton, ThemeUICSSObject } from 'theme-ui';
import { Icons } from '../ui/Icons';
import { Category } from './category.types';

type Props = {
  category: Category | null;
  defaultIcon: string;
};

export function CategoryIcon({ category, defaultIcon }: Props) {
  return (
    <IconButton sx={iconStyle} style={{ backgroundColor: category?.color }}>
      <Icons name={category?.icon ?? defaultIcon} sx={svgStyle} />
    </IconButton>
  );
}

const iconStyle: ThemeUICSSObject = {
  backgroundColor: 'gray.4',
  borderRadius: '50%',
};

const svgStyle: ThemeUICSSObject = { width: 16, height: 16 };
