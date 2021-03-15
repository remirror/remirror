import {
  ExtensionPriority,
  KeyBindingCommandFunction,
  KeyBindingNames,
  KeymapExtension,
  LiteralUnion,
} from '@remirror/core';
import { useExtension } from '@remirror/react-core';

/**
 * Add custom keyboard bindings to the editor instance.
 *
 * @remarks
 *
 * ```tsx
 * import { useCallback } from 'react';
 * import { BoldExtension } from 'remirror/extensions';
 * import { Remirror, useHelpers, useKeymap, useRemirror, useRemirrorContext } from '@remirror/react';
 *
 * const hooks = [
 *   () => {
 *     const active = useActive();
 *     const { insertText } = useCommands();
 *     const boldActive = active.bold();
 *     const handler = useCallback(() => {
 *       if (!boldActive) {
 *         return false;
 *       }
 *
 *       // Prevent the keypress from using the default action.
 *       return insertText.original('\n\nWoah there!')(props);
 *     }, [boldActive, insertText]);
 *
 *     useKeymap('Shift-Enter', handler); // Add the handler to the keypress pattern.
 *   },
 * ];
 *
 * const Editor = () => {
 *   const { manager } = useRemirror({ extensions: () => [new BoldExtension()] });
 *
 *   return <Remirror manager={manager} hooks={hooks} />;
 * };
 * ```
 */
export function useKeymap(
  name: LiteralUnion<KeyBindingNames, string>,
  handler: KeyBindingCommandFunction,
  priority = ExtensionPriority.Medium,
): void {
  useExtension(
    KeymapExtension,
    ({ addCustomHandler }) => addCustomHandler('keymap', [priority, { [name]: handler }]),
    [priority, name, handler],
  );
}
