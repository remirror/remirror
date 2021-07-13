import { FC } from 'react';
import { RemirrorJSON } from '@remirror/core';

import { MarkMap, RemirrorRenderer } from '../';

export const Callout: FC<{
  node: RemirrorJSON;
  markMap: MarkMap;
  children?: never;
}> = (props) => {
  const content = props.node.content;

  if (!content) {
    return null;
  }

  const children = content.map((node, ii) => {
    return <RemirrorRenderer json={node} key={ii} {...props} />;
  });

  const calloutType = props.node.attrs?.type;

  return <div data-callout-type={calloutType}>{children}</div>;
};
