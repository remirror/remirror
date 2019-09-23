/** @jsx jsx */

import CodeBlock from '@theme-ui/prism';
import { ComponentType, ElementType, PropsWithChildren } from 'react';
import { jsx } from 'theme-ui';

const heading = (Tag: ElementType): ComponentType<{ id: string }> => props =>
  props.id ? (
    <Tag {...props}>
      <a
        href={`#${props.id}`}
        sx={{
          color: 'inherit',
          textDecoration: 'none',
          ':hover': {
            textDecoration: 'underline',
          },
        }}
      >
        {props.children}
      </a>
    </Tag>
  ) : (
    <Tag {...props} />
  );

export default {
  code: CodeBlock,
  pre: ({ children }: PropsWithChildren<{}>) => <div>{children}</div>,
  h2: heading('h2'),
  h3: heading('h3'),
  h4: heading('h4'),
  h5: heading('h5'),
  h6: heading('h6'),
};
