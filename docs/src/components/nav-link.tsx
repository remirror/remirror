/** @jsx jsx */
import { Link } from 'gatsby';
import isAbsoluteURL from 'is-absolute-url';
import { FC } from 'react';
import { jsx } from 'theme-ui';

const styles = {
  display: 'block',
  px: 2,
  py: 2,
  color: 'inherit',
  textDecoration: 'none',
  fontSize: 1,
  fontWeight: 'bold',
  '&.active': {
    color: 'primary',
  },
};

interface NavLinkProps {
  href?: string;
  to?: string;
}

export const NavLink: FC<NavLinkProps> = ({ href, ...props }) => {
  const isExternal = isAbsoluteURL(href ?? '');

  if (isExternal) {
    return <a {...props} href={href} sx={styles} />;
  }

  const to = (props.to ?? href) as string;
  return <Link {...props} to={to} sx={styles} activeClassName='active' />;
};

export default NavLink;
