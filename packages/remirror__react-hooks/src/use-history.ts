import { useCallback } from 'react';
import type { GetHandler, StringKey } from '@remirror/core';
import { HistoryExtension, HistoryOptions } from '@remirror/extension-history';
import { useExtensionCallback } from '@remirror/react-core';

/**
 * A hook which is called every time an undo or redo event is triggered from
 * within the ProseMirror history extension.
 *
 * @remarks
 *
 * `handler` should be a memoized function.
 */
export function useHistory<Key extends StringKey<GetHandler<HistoryOptions>>>(
  event: Key,
  handler: GetHandler<HistoryOptions>[Key],
): void {
  useExtensionCallback(
    HistoryExtension,
    useCallback(({ addHandler }) => addHandler(event, handler), [event, handler]),
  );
}
