import { AnyExtension, ChainedFromExtensions, CommandsFromExtensions } from '@remirror/core';

import { useRemirrorContext } from './use-remirror-context';

/**
 * A core hook which provides the commands for usage in your editor.
 *
 * ```tsx
 * import { useCommands } from 'remirror/react';
 *
 * const EditorButton = () => {
 *   const commands = useCommands();
 *
 *   return (
 *     <>
 *       <button onClick={() => commands.toggleBold()}>
 *         Click me!
 *       </button>
 *     </>
 *   );
 * }
 * ````
 */
export function useCommands<
  Extension extends AnyExtension = Remirror.Extensions
>(): CommandsFromExtensions<Extension> {
  return useRemirrorContext<Extension>().commands;
}

/**
 * A core hook which provides the chainable commands for usage in your editor.
 *
 * ```tsx
 * import { useCommandsChain } from 'remirror/react';
 *
 * const EditorButton = () => {
 *   const chain = useCommandsChain();
 *
 *   return (
 *     <>
 *       <button onClick={() => chain.toggleBold().toggleItalic().run()}>
 *         Chain me!
 *       </button>
 *     </>
 *   );
 * }
 * ````
 */
export function useCommandsChain<
  Extension extends AnyExtension = Remirror.Extensions
>(): ChainedFromExtensions<Extension> {
  return useRemirrorContext<Extension>().chain;
}
