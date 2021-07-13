import { FC, Fragment } from 'react';
import { isString, ObjectMark, RemirrorJSON } from '@remirror/core';

import { MarkMap } from '../types';

interface TextHandlerProps {
  node: RemirrorJSON;
  markMap: MarkMap;
  skipUnknownMarks?: boolean;
}

const normalizeMark = (mark: ObjectMark | string) =>
  isString(mark) ? { type: mark, attrs: {} } : { attrs: {}, ...mark };

export const TextHandler: FC<TextHandlerProps> = ({ node, ...props }) => {
  if (!node.text) {
    return null;
  }

  let textElement = <Fragment>{node.text}</Fragment>;

  if (!node.marks) {
    return textElement;
  }

  for (const mark of node.marks) {
    const normalized = normalizeMark(mark);
    const MarkHandler = props.markMap[normalized.type];

    if (!MarkHandler) {
      if (!props.skipUnknownMarks) {
        throw new Error(`No handler for mark type \`${normalized.type}\` registered`);
      }

      continue;
    }

    textElement = <MarkHandler {...normalized.attrs}>{textElement}</MarkHandler>;
  }

  return textElement;
};
