import type { AnyExtension, RemirrorManager } from '@remirror/core';

import { ReactFrameworkOutput } from '../react-types';
import { useRemirrorContext } from './use-remirror-context';

type UseActiveReturn<Extension extends AnyExtension> = ReactFrameworkOutput<
  RemirrorManager<Extension>['~E']
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
export function useActive<Extension extends AnyExtension = Remirror.Extensions>(
  autoUpdate = true,
): UseActiveReturn<Extension> {
  return useRemirrorContext<Extension>({ autoUpdate }).active;
}
