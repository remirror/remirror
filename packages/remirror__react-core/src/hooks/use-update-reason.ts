import { useState } from 'react';
import { PluginsExtension } from '@remirror/core';

import { useExtension } from './use-extension';

const noReason: UpdateReason = { doc: false, selection: false, storedMark: false };

/**
 * Provide the reason for the latest state update with boolean flags.
 */
export function useUpdateReason(): UpdateReason {
  const [updateReason, setUpdateReason] = useState<UpdateReason>(noReason);
  // Attach the editor state handler to the instance of the remirror editor.
  useExtension(
    PluginsExtension,
    (p) =>
      p.addHandler('applyState', ({ tr }) => {
        const reason: UpdateReason = { ...noReason };

        if (tr.docChanged) {
          reason.doc = true;
        }

        if (tr.selectionSet) {
          reason.selection = true;
        }

        if (tr.storedMarksSet) {
          reason.storedMark = true;
        }

        setUpdateReason(reason);
      }),
    [],
  );

  return updateReason;
}

export interface UpdateReason {
  /**
   * The selection changed.
   */
  selection: boolean;

  /**
   * The document changed.
   */
  doc: boolean;

  /**
   * A stored mark was added to the current selection
   */
  storedMark: boolean;
}
