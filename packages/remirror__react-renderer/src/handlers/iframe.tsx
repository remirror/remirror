import { FC } from 'react';
import { Literal, RemirrorJSON } from '@remirror/core';

import { MarkMap } from '../types';

export const createIFrameHandler = (overwriteAttrs?: Record<string, Literal>) => {
  const iframeHandler: FC<{
    node: RemirrorJSON;
    markMap: MarkMap;
  }> = (props) => {
    // Remove remirror-internal attributes
    const { allowFullScreen, type, ...attrs } = props.node.attrs ?? {};
    const normalizedAttrs = {
      ...attrs,
      // Prevent React error that allowFullScreen must be boolean (but is string in remirror)
      allowFullScreen: allowFullScreen !== 'false',
      ...overwriteAttrs,
    };
    return <iframe {...normalizedAttrs} />;
  };
  return iframeHandler;
};
