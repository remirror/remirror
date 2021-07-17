import { ContextMenuEventHandler } from '@remirror/extension-events';

import { useEvent } from './use-event';

/**
 * A hook which listens to context menu events.
 *
 * In order to fully override the context menu events when they occur in the
 * editor make sure to call `event.preventDefault()` this will allow you to
 * replace the default context menu with your own version.
 */
export function useContextMenu(handler: ContextMenuEventHandler): void {
  useEvent('contextmenu', handler);
}
