import type { AnyExtension, HelpersFromExtensions } from '@remirror/core';

import { useRemirrorContext } from './use-remirror-context';

/**
 * A core hook which provides the helpers for usage in your editor.
 *
 * ```tsx
 * import { useHelpers } from '@remirror/react';
 *
 * const EditorButton = () => {
 *   const helpers = useHelpers();
 *
 *   return (
 *     <>
 *       <button onClick={() => helpers.toggleBold()}>
 *         Click me!
 *       </button>
 *       <button onClick={() => helpers.chain.toggleBold().toggleItalic().run()}>
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
export function useHelpers<Extension extends AnyExtension = Remirror.Extensions>(
  update = false,
): HelpersFromExtensions<Extension> {
  return useRemirrorContext<Extension>(update ? { autoUpdate: true } : undefined).helpers;
}
