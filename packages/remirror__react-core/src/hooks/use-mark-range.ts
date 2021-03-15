import { GetMarkRange, getMarkRange } from '@remirror/core';

import { useRemirrorContext } from './use-remirror-context';

/**
 * A hook which returns the selected range of the mark of the provided type.
 */
export function useMarkRange(type: string): GetMarkRange | undefined {
  const { getState } = useRemirrorContext({ autoUpdate: true });
  const { $from, $to } = getState().selection;
  return getMarkRange($from, type, $to);
}
