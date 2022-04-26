import type { GetHandler, StringKey } from '@remirror/core';
import { EventsExtension, EventsOptions } from '@remirror/extension-events';
import { useExtensionEvent } from '@remirror/react-core';

/**
 * A hook for subscribing to events from the editor.
 */
export function useEvent<Key extends StringKey<GetHandler<EventsOptions>>>(
  event: Key,
  handler: NonNullable<GetHandler<EventsOptions>[Key]>,
): void {
  useExtensionEvent(EventsExtension, event, handler);
}

/**
 * @deprecated prefer `useEvent`
 */
export const useEvents = useEvent;
