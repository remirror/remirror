import { useCallback, useState } from 'react';

import type { FocusType } from '@remirror/core';
import { useRemirror } from '@remirror/react';

import { useEvents } from './use-events';

/**
 * Keep track of the editor focus.
 *
 * Returns a focused value which is updated whenever the editor focus changes.
 *
 * When `true`, the editor is focused when `false` the editor is not focused.
 */
export function useEditorFocus(): [isFocused: boolean, focus: (position?: FocusType) => void] {
  // Get the view from the context and use it to calculate the initial focus.
  const { view, focus } = useRemirror();

  // Create the initial state with the current view focus.
  const [isFocused, setIsFocused] = useState(() => view.hasFocus());

  // Listen to blur events and set focused to false in those instances.
  useEvents(
    'blur',
    useCallback(() => {
      setIsFocused(false);

      // Returning false means that other event listeners will still receive
      // this event.
      return false;
    }, [setIsFocused]),
  );

  // Listen to focus events and set focused to true in those instances.
  useEvents(
    'focus',
    useCallback(() => {
      setIsFocused(true);

      // Returning false means that other event listeners will still receive
      // this event.
      return false;
    }, [setIsFocused]),
  );

  return [isFocused, focus];
}
