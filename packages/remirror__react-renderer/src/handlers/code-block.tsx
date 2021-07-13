import { FC } from 'react';
import { RemirrorJSON } from '@remirror/core';

import { MarkMap } from '../types';
import { TextHandler } from './text';

export const CodeBlock: FC<{
  node: RemirrorJSON;
  markMap: MarkMap;
}> = (props) => {
  const content = props.node.content;

  if (!content) {
    return null;
  }

  const children = content.map((node, ii) => {
    return <TextHandler key={ii} {...{ ...props, node }} />;
  });

  return (
    <pre>
      <code>{children}</code>
    </pre>
  );
};
