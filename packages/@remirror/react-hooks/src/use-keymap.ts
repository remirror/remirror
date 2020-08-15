import { KeyBindings, KeymapExtension } from '@remirror/core';
import { useExtension } from '@remirror/react';

/**
 * Add custom keyboard bindings to the editor instance.
 *
 * @remarks
 *
 * ```tsx
 * import { useKeymap } from 'remirror/react/hooks/use-keymap';
 * import { RemirrorProvider, useRemirror, useManager } from 'remirror/react';
 *
 * const Wrapper = () => {
 *   const manager = useManager(() => []);
 *
 *   return (
 *     <RemirrorProvider manager={manager}>
 *       <Editor />
 *     </RemirrorProvider>
 *   );
 * };
 *
 * const Editor = () => {
 *   const { getRootProps } = useRemirror({ autoUpdate: true });
 *
 *   useKeyBindings({
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
export function useKeymap(bindings: KeyBindings) {
  useExtension(
    KeymapExtension,
    ({ addCustomHandler }) => {
      return addCustomHandler('keymap', bindings);
    },
    [bindings],
  );
}

export default useKeymap;
