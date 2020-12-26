import { createContext } from 'react';
import type { EditorState, RemirrorJSON } from 'remirror';

export interface PlaygroundContextObject {
  setContent: (state: Readonly<EditorState>) => void;
  onContentChange: (callback: (state: RemirrorJSON) => void) => void;
}

export const PlaygroundContext = createContext<PlaygroundContextObject>({
  setContent: () => {
    console.warn('No playground context found, setContent ignored');
  },
  onContentChange: () => {
    return () => {};
  },
});
