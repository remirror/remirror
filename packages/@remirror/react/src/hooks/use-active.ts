import type { AnyExtension, RemirrorManager } from '@remirror/core';

import { ReactFrameworkOutput } from '../react-types';
import { useRemirrorContext } from './use-remirror-context';

type UseActiveReturn<ExtensionUnion extends AnyExtension> = ReactFrameworkOutput<
  RemirrorManager<ExtensionUnion>['~E']
>['active'];

/**
 * This is a shorthand method for retrieving the active available in the
 * editor.
 *
 * ```ts
 * import { useActive } from 'remirror/react';
 * ```
 *
 * This hooks updates the local component on each state update for the editor,
 * so it can be quite expensive.
 *
 * @param autoUpdate - Set to false to prevent automatic re-rendering on every
 * state update.
 */
export function useActive<ExtensionUnion extends AnyExtension = Remirror.AllExtensionUnion>(
  autoUpdate = true,
): UseActiveReturn<ExtensionUnion> {
  return useRemirrorContext<ExtensionUnion>({ autoUpdate }).active;
}
