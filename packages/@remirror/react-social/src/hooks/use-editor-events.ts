import type { GetHandler, StringKey } from '@remirror/core';
import { EventsExtension, EventsOptions } from '@remirror/extension-events';
import { useExtension } from '@remirror/react';

/**
 * Add editor specific events.
 */
export function useEditorEvents<Key extends StringKey<GetHandler<EventsOptions>>>(
  event: Key,
  handler: GetHandler<EventsOptions>[Key],
) {
  useExtension(
    EventsExtension,
    ({ addHandler }) => {
      return addHandler(event, handler);
    },
    [event, handler],
  );
}
