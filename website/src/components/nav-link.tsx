import Link from '@docusaurus/Link';
import isAbsoluteURL from 'is-absolute-url';
import { FC } from 'react';

import styles from './components.module.css';
import { ExternalIcon } from './external-icon';

interface NavLinkProps {
  href?: string;
  to?: string;
}

export const NavLink: FC<NavLinkProps> = ({ href, children, ...props }) => {
  const isExternal = isAbsoluteURL(href ?? '');

  if (isExternal) {
    return (
      <Link {...props} href={href} className={styles.link}>
        {children} <ExternalIcon />
      </Link>
    );
  }

  const to = (props.to ?? href) as string;
  return <Link {...props} to={to} className={styles.link} />;
};

export default NavLink;
