import { NavLink } from 'react-router-dom';
import { VisuallyHidden } from 'reakit/VisuallyHidden';
import { Flex, IconButton, ThemeUICSSObject } from 'theme-ui';
import { Icons } from '../ui/Icons';

export type NavigationProps = {
  sx?: any;
};

export function Navigation({ sx }: NavigationProps) {
  return (
    <Flex
      sx={{
        ...navStyle,
        ...sx,
      }}
    >
      <NavLink to="/" end style={linkStyle}>
        {({ isActive }) => (
          <IconButton sx={isActive ? { ...activeIconStyle, ...iconStyle } : iconStyle}>
            <VisuallyHidden>Homepage</VisuallyHidden>
            <Icons name="grid" />
          </IconButton>
        )}
      </NavLink>
      <NavLink to="/budgets" style={linkStyle}>
        {({ isActive }) => (
          <IconButton sx={isActive ? { ...activeIconStyle, ...iconStyle } : iconStyle}>
            <VisuallyHidden>Budgets</VisuallyHidden>
            <Icons name="wallet-fill" />
          </IconButton>
        )}
      </NavLink>
      <NavLink to="/accounts" style={linkStyle}>
        {({ isActive }) => (
          <IconButton sx={isActive ? { ...activeIconStyle, ...iconStyle } : iconStyle}>
            <VisuallyHidden>Accounts</VisuallyHidden>
            <Icons name="credit-card" />
          </IconButton>
        )}
      </NavLink>
      <NavLink to="/settings" style={linkStyle}>
        {({ isActive }) => (
          <IconButton sx={isActive ? { ...activeIconStyle, ...iconStyle } : iconStyle}>
            <VisuallyHidden>Settings</VisuallyHidden>
            <Icons name="gear-wide" />
          </IconButton>
        )}
      </NavLink>
    </Flex>
  );
}

const linkStyle = { color: 'currentcolor' };

const navStyle: ThemeUICSSObject = {
  bg: 'backgroundInverse',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  color: 'textInverse',
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: [5],
  p: [4],
  width: '100%',
};

const activeIconStyle: any = {
  color: 'primary',
};

const iconStyle: any = {
  ':hover': activeIconStyle,
};
