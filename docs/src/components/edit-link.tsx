/** @jsx jsx */
import { FC, ReactNode } from 'react';
import { jsx } from 'theme-ui';

interface EditLinkProps {
  /**
   * The base url to the documentation folder.
   */
  base?: string;

  relativePath: string;

  /**
   * The child node to display.
   */
  children?: ReactNode;
}

export const EditLink: FC<EditLinkProps> = ({
  base = 'https://github.com/ifiokr/remirror/edit/canary/',
  children = 'Edit the page on GitHub',
  relativePath,
  ...props
}) => {
  const href = `${base}${relativePath}`;

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

export default EditLink;
