import { useCallback, useContext, useEffect, useState } from 'react';
import type {
  AnyExtension,
  EditorState,
  EditorView,
  RemirrorEventListener,
  RemirrorJSON,
  RemirrorManager,
} from 'remirror';

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
  extensionManager: RemirrorManager<AnyExtension>,
): {
  value: EditorState;
  onChange: RemirrorEventListener<AnyExtension>;
} {
  const playground = useContext(PlaygroundContext);
  const [value, setValue] = useState<EditorState>(() =>
    extensionManager.createState({
      content: PERSIST.lastKnownGoodState
        ? (PERSIST.lastKnownGoodState.doc.toJSON() as RemirrorJSON)
        : extensionManager.createEmptyDoc(),
    }),
  );
  const onChange = useCallback<RemirrorEventListener<AnyExtension>>((event) => {
    PERSIST.lastKnownGoodState = event.state;
    setValue(event.state);
  }, []);

  useEffect(() => {
    playground.setContent(value);
  }, [playground, value]);

  useEffect(() => {
    return playground.onContentChange((json) => {
      const state = extensionManager.createState({
        content: json,
      });
      PERSIST.lastKnownGoodState = state;
      setValue(state);
    });
  }, [playground, extensionManager]);

  return { value, onChange };
}
