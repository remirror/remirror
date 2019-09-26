/** @jsx jsx */

import CodeBlock from '@theme-ui/prism';
import { ElementType, FC } from 'react';
import { jsx } from 'theme-ui';
import { isString } from 'remirror';
import { capitalize } from '@remirror/core-helpers';

const heading = (Tag: ElementType) => {
  const Component: FC<{ id: string }> = props =>
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
  Component.displayName = isString(Tag) ? capitalize(Tag) : 'Heading';

  return Component;
};

const Pre: FC = ({ children }) => <div>{children}</div>;
Pre.displayName = 'Pre';

export default {
  code: CodeBlock,
  pre: Pre,
  h2: heading('h2'),
  h3: heading('h3'),
  h4: heading('h4'),
  h5: heading('h5'),
  h6: heading('h6'),
};
