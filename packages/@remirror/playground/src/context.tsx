import React from 'react';

import type { EditorState, RemirrorJSON } from 'remirror/core';

export interface PlaygroundContextObject {
  setContent: (state: Readonly<EditorState>) => void;
  onContentChange: (callback: (state: RemirrorJSON) => void) => void;
}

export const PlaygroundContext = React.createContext<PlaygroundContextObject>({
  setContent: () => {
    console.warn('No playground context found, setContent ignored');
  },
  onContentChange: () => {
    return () => {};
  },
});
