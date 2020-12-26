import { AnyExtension, RemirrorManager } from '@remirror/core';

import { ReactFrameworkOutput } from '../react-types';
import { useRemirrorContext } from './use-remirror-context';

type UseCommandsReturn<ExtensionUnion extends AnyExtension> = Pick<
  ReactFrameworkOutput<RemirrorManager<ExtensionUnion>['~E']>,
  'chain' | 'commands'
>;

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
 *       <button onClick={() => commands.chain.toggleBold().toggleItalic().run()}>
 *         Chain me!
 *       </button>
 *     </>
 *   );
 * }
 * ````
 */
export function useCommands<
  ExtensionUnion extends AnyExtension = Remirror.AllExtensionUnion
>(): UseCommandsReturn<ExtensionUnion> {
  const { commands, chain } = useRemirrorContext<ExtensionUnion>();

  return { commands, chain };
}
