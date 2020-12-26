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
 */
export function useActive<
  ExtensionUnion extends AnyExtension = Remirror.AllExtensionUnion
>(): UseActiveReturn<ExtensionUnion> {
  return useRemirrorContext<ExtensionUnion>({ autoUpdate: true }).active;
}
