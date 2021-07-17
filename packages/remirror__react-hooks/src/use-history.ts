import type { GetHandler, StringKey } from '@remirror/core';
import { HistoryExtension, HistoryOptions } from '@remirror/extension-history';
import { useExtension } from '@remirror/react-core';

/**
 * A hook which is called every time an undo or redo event is triggered from
 * within the ProseMirror history extension.
 */
export function useHistory<Key extends StringKey<GetHandler<HistoryOptions>>>(
  event: Key,
  handler: GetHandler<HistoryOptions>[Key],
): void {
  useExtension(HistoryExtension, ({ addHandler }) => addHandler(event, handler), [event, handler]);
}
