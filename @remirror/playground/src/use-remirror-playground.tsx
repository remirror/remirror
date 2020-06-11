import { useEffect } from 'react';

import { useRemirror } from '@remirror/react';

declare global {
  interface Window {
    REMIRROR_PLAYGROUND_PERSIST: {
      previousManager: any;
      lastKnownGoodState: any;
    };
  }
}

if (!window.REMIRROR_PLAYGROUND_PERSIST) {
  window.REMIRROR_PLAYGROUND_PERSIST = { previousManager: null, lastKnownGoodState: null };
}

const PERSIST = window.REMIRROR_PLAYGROUND_PERSIST;

PERSIST.previousManager = null;
PERSIST.lastKnownGoodState = null;

export function useRemirrorPlayground() {
  const remirror = useRemirror();
  const manager = remirror.manager;
  useEffect(() => {
    if (manager != PERSIST.previousManager) {
      // The manager has changed - implies new code context

      PERSIST.previousManager = manager;
      if (PERSIST.lastKnownGoodState) {
        // RESTORE STATE
        remirror.setContent(PERSIST.lastKnownGoodState.doc);
      }
    } else {
      // STORE STATE
      PERSIST.lastKnownGoodState = remirror.state.newState;
    }
  }, [remirror.state.newState, manager]);
}
