import type { GetHandler, StringKey } from '@remirror/core';
import { EventsExtension, EventsOptions } from '@remirror/extension-events';
import { useExtension } from '@remirror/react';

/**
 * A hook for subscribing to events from the editor.
 */
export function useEvents<Key extends StringKey<GetHandler<EventsOptions>>>(
  event: Key,
  handler: GetHandler<EventsOptions>[Key],
): void {
  useExtension(
    EventsExtension,
    ({ addHandler }) => {
      return addHandler(event, handler);
    },
    [event, handler],
  );
}
