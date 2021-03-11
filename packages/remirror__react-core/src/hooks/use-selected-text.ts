import { isTextSelection } from '@remirror/core';

import { useRemirrorContext } from './use-remirror-context';

/**
 * A core hook which provides the the currently selected text.
 *
 * ```tsx
 * import { useSelectedText } from '@remirror/react';
 *
 * const RandomSpan = () => {
 *   const text = useSelectedText();
 *
 *   return text  && <span>{text}</span>;
 * }
 * ````
 *
 * Return the value of the currently selected text. When the text selection is empty
 */
export function useSelectedText(): string | undefined {
  const { getState, helpers } = useRemirrorContext({ autoUpdate: true });
  const { selection, doc } = getState();

  if (!isTextSelection(selection) || selection.empty) {
    return;
  }

  const { from, to } = selection;

  return helpers.getTextBetween(from, to, doc);
}
