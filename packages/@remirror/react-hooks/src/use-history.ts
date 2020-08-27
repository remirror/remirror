import type { GetHandler, StringKey } from '@remirror/core';
import { HistoryExtension, HistoryOptions } from '@remirror/extension-history';
import { useExtension } from '@remirror/react';

/**
 * A hook for to the undo and redo events from the ProseMirror history extension.
 */
export function useHistory<Key extends StringKey<GetHandler<HistoryOptions>>>(
  event: Key,
  handler: GetHandler<HistoryOptions>[Key],
): void {
  useExtension(
    HistoryExtension,
    ({ addHandler }) => {
      return addHandler(event, handler);
    },
    [event, handler],
  );
}
