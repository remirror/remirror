import type { AnyExtension, RemirrorManager } from '@remirror/core';

import { ReactFrameworkOutput } from '../react-types';
import { useRemirrorContext } from './use-remirror-context';

type UseHelpersReturn<ExtensionUnion extends AnyExtension> = ReactFrameworkOutput<
  RemirrorManager<ExtensionUnion>['~E']
>['helpers'];

/**
 * A core hook which provides the helpers for usage in your editor.
 *
 * ```tsx
 * import { useHelpers } from 'remirror/react';
 *
 * const EditorButton = () => {
 *   const helpers = useHelpers();
 *
 *   return (
 *     <>
 *       <button onClick={() => Helpers.toggleBold()}>
 *         Click me!
 *       </button>
 *       <button onClick={() => Helpers.chain.toggleBold().toggleItalic().run()}>
 *         Chain me!
 *       </button>
 *     </>
 *   );
 * }
 * ````
 *
 * Passing `true` as the first argument will ensure that the component this hook
 * is placed inside will rerender on every update.
 */
export function useHelpers<ExtensionUnion extends AnyExtension = Remirror.AllExtensionUnion>(
  update = false,
): UseHelpersReturn<ExtensionUnion> {
  return useRemirrorContext<ExtensionUnion>(update ? { autoUpdate: true } : undefined).helpers;
}
