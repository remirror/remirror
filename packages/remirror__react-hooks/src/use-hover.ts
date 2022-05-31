import { HoverEventHandler } from '@remirror/extension-events';

import { useEditorEvent } from './use-editor-event';

/**
 * A hook which listens to hover events.
 *
 * Provide a memoized handler which is provided with the nodes which were
 * directly touched by the `hover: true` or `hover: false` event.
 */
export function useHover(handler: HoverEventHandler): void {
  useEditorEvent('hover', handler);
}
