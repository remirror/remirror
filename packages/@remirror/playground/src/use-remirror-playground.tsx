import { useCallback, useState, useEffect, useContext } from 'react';

import {
  AnyCombinedUnion,
  EditorState,
  EditorView,
  EMPTY_PARAGRAPH_NODE,
  RemirrorEventListener,
  RemirrorJSON,
  RemirrorManager,
} from 'remirror/core';
import { PlaygroundContext } from './context';

declare global {
  interface Window {
    REMIRROR_PLAYGROUND_PERSIST: {
      previousView: EditorView | null;
      lastKnownGoodState: EditorState | null;
    };
  }
}

if (!window.REMIRROR_PLAYGROUND_PERSIST) {
  window.REMIRROR_PLAYGROUND_PERSIST = { previousView: null, lastKnownGoodState: null };
}

const PERSIST = window.REMIRROR_PLAYGROUND_PERSIST;

PERSIST.previousView = null;
PERSIST.lastKnownGoodState = null;

export function useRemirrorPlayground(
  extensionManager: RemirrorManager<AnyCombinedUnion>,
): {
  value: EditorState;
  onChange: RemirrorEventListener<AnyCombinedUnion>;
} {
  const playground = useContext(PlaygroundContext);
  const [value, setValue] = useState<EditorState>(
    extensionManager.createState({
      content: PERSIST.lastKnownGoodState
        ? (PERSIST.lastKnownGoodState.doc.toJSON() as RemirrorJSON)
        : EMPTY_PARAGRAPH_NODE,
    }),
  );
  const onChange = useCallback<RemirrorEventListener<AnyCombinedUnion>>((event) => {
    PERSIST.lastKnownGoodState = event.state;
    setValue(event.state);
  }, []);

  useEffect(() => {
    playground.setContent(value);
  }, [value]);

  return { value, onChange };
}
