import Link from '@docusaurus/Link';
import { css } from '@emotion/css';
import isAbsoluteURL from 'is-absolute-url';
import { FC } from 'react';

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

const styles = {
  link: css`
    display: block;
    padding: 0.5rem;
    color: inherit;

    text-decoration: none;
    font-weight: bold;
  `,
};
