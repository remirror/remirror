import { createElement, FC } from 'react';
import { RemirrorJSON } from '@remirror/core';

import { MarkMap } from '../types';
import { TextHandler } from './text';

export const Heading: FC<{
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

  const level = (props.node.attrs?.level as number) ?? 1;

  return createElement(`h${level}`, null, children);
};
