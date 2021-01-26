import { useCallback, useState } from 'react';
import type { FocusType } from '@remirror/core';
import { useRemirrorContext } from '@remirror/react-core';

import { useEvents } from './use-events';

export interface UseEditorFocusProps {
  /**
   * The elements that can be focused without setting `isFocused` to false.
   */
  ignoredElements?: Array<Element | null>;

  /**
   * Whether to set focused to false when the focus is lost by actions taken outside of the dom.
   *
   * @default false
   */
  blurOnInactive?: boolean;
}

/**
 * Keep track of the editor focus.
 *
 * Returns a focused value which is updated whenever the editor focus changes.
 *
 * When `true`, the editor is focused when `false` the editor is not focused.
 */
export function useEditorFocus(
  props: UseEditorFocusProps = {},
): [isFocused: boolean, focus: (position?: FocusType) => void] {
  const { ignoredElements = [], blurOnInactive = false } = props;

  // Get the view from the context and use it to calculate the initial focus.
  const { view, commands } = useRemirrorContext();

  // Create the initial state with the current view focus.
  const [isFocused, setIsFocused] = useState(() => view.hasFocus());

  // Listen to blur events and set focused to false in those instances.
  useEvents(
    'blur',
    useCallback(
      (_: FocusEvent) => {
        const focusedElement = document.activeElement;
        const ignoreBlur = !blurOnInactive && !focusedElement;

        if (ignoreBlur || view.dom.contains(focusedElement)) {
          return false;
        }

        for (const element of ignoredElements) {
          if (element?.contains(focusedElement)) {
            return false;
          }
        }

        setIsFocused(false);

        return false;
      },
      [blurOnInactive, ignoredElements, view.dom],
    ),
  );

  // Listen to focus events and set focused to true in those instances.
  useEvents(
    'focus',
    useCallback(
      (_: FocusEvent) => {
        if (isFocused) {
          return false;
        }

        setIsFocused(true);

        return false;
      },
      [isFocused],
    ),
  );

  return [isFocused, commands.focus];
}
