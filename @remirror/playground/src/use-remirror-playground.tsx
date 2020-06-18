import { useCallback, useEffect, useState } from 'react';

import {
  EditorManager,
  EditorState,
  EMPTY_PARAGRAPH_NODE,
  RemirrorEventListener,
} from 'remirror/core';

declare global {
  interface Window {
    REMIRROR_PLAYGROUND_PERSIST: {
      previousView: any;
      lastKnownGoodState: any;
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
  extensionManager: EditorManager<any>,
): {
  value: EditorState;
  onChange: RemirrorEventListener<any>;
} {
  const [value, setValue] = useState<EditorState>(
    PERSIST.lastKnownGoodState ||
      extensionManager.createState({
        content: EMPTY_PARAGRAPH_NODE,
      }),
  );
  const onChange = useCallback<RemirrorEventListener<any>>((event) => {
    PERSIST.lastKnownGoodState = event.state;
    setValue(event.state);
  }, []);

  return { value, onChange };
}
