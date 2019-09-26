/** @jsx jsx */
import { Location, LocationProviderRenderFn, WindowLocation } from '@reach/router';
import { FC, ReactNode } from 'react';
import { jsx } from 'theme-ui';

const getHREF = (base: string, location: WindowLocation) => {
  if (location.pathname === '/') {
    return false;
  }

  return `${base + location.pathname.replace(/\/+$/, '')}.mdx`;
};

interface EditLinkProps {
  /**
   * The base url to the documentation folder.
   */
  base?: string;

  /**
   * The child node to display.
   */
  children?: ReactNode;
}

export const EditLink: FC<EditLinkProps> = ({
  base = 'https://github.com/ifiokr/remirror/edit/canary/docs/pages',
  children = 'Edit the page on GitHub',
  ...props
}) => {
  const renderFn: LocationProviderRenderFn = ({ location }) => {
    const href = getHREF(base, location);
    if (!href) {
      return false;
    }
    return (
      <a
        {...props}
        href={href}
        sx={{
          display: 'inline-block',
          color: 'inherit',
          fontSize: 1,
          my: 4,
        }}
      >
        {children}
      </a>
    );
  };

  return <Location>{renderFn}</Location>;
};

export default EditLink;
