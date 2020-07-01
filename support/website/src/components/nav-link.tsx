import Link from '@docusaurus/Link';
import isAbsoluteURL from 'is-absolute-url';
import React, { FC } from 'react';

import styles from './components.module.css';

export const ExternalIcon = () => {
  return (
    <svg viewBox='0 0 24 24' className={styles.externalIcon}>
      <path fill='none' d='M0 0h24v24H0z' />
      <path
        stroke='currentColor'
        strokeWidth='0.7px'
        fill='currentColor'
        d='M10 6v2H5v11h11v-5h2v6a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1h6zm11-3v8h-2V6.413l-7.793 7.794-1.414-1.414L17.585 5H13V3h8z'
      />
    </svg>
  );
};

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
