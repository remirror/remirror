import React, { FC } from 'react';
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

  const children = content.map((node, ii) => <RemirrorRenderer json={node} key={ii} {...props} />);

  const { type, emoji } = props.node.attrs ?? {};
  const dataAttrs: Record<string, unknown> = { 'data-callout-type': type };

  if (emoji) {
    dataAttrs['data-callout-emoji'] = emoji;
  }

  return (
    <div {...dataAttrs}>
      {emoji ? (
        <div className='remirror-callout-emoji-wrapper'>
          <span>{emoji as string}</span>
        </div>
      ) : null}
      <div>{children}</div>
    </div>
  );
};
