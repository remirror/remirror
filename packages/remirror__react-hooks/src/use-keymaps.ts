import { ExtensionPriority, KeyBindings, KeymapExtension } from '@remirror/core';
import { useExtension } from '@remirror/react-core';

/**
 * Add custom keyboard bindings to the editor instance.
 *
 * @remarks
 *
 * ```tsx
 * import { Remirror, useRemirror, useRemirrorContext, useKeymaps  } from '@remirror/react';
 *
 * const Editor = () => {
 *   const { manager } = useRemirror({ extensions: () => [] });
 *
 *   return (
 *     <Remirror manager={manager}>
 *       <EditorBindings />
 *     </Remirror>
 *   );
 * };
 *
 * const EditorBindings = () => {
 *   const { getRootProps } = useRemirrorContext({ autoUpdate: true });
 *
 *   useKeymaps({
 *     Enter: () => {
 *       // Prevent the tne enter key from being pressed.
 *       return true;
 *     }
 *   });
 *
 *   return <div {...getRootProps()} />;
 * };
 * ```
 */
export function useKeymaps(bindings: KeyBindings, priority = ExtensionPriority.Medium): void {
  useExtension(
    KeymapExtension,
    ({ addCustomHandler }) => addCustomHandler('keymap', [priority, bindings]),
    [priority, bindings],
  );
}
