import React, { FC, useEffect, useMemo, useState } from 'react';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';

import { ExampleRichSocialEditor } from './rich';

const RichSocialEditorWithCollab: FC = () => {
  const [browser, setBrowser] = useState(false);
  useEffect(() => {
    const isBrowser = typeof window !== 'undefined';
    if (browser !== isBrowser) {
      setTimeout(() => {
        setBrowser(isBrowser);
      }, 5000);
    }
  }, [browser]);
  const ydoc = useMemo(() => (browser ? new Y.Doc() : null), [browser]);
  const provider = useMemo(
    () => (ydoc ? new WebsocketProvider('ws://localhost:1234', 'prosemirror', ydoc) : null),
    [ydoc],
  );

  return provider ? (
    <ExampleRichSocialEditor suppressHydrationWarning={true} collaboration={provider} />
  ) : null;
};
RichSocialEditorWithCollab.displayName = 'RichSocialEditorWithCollab';

export default RichSocialEditorWithCollab;
