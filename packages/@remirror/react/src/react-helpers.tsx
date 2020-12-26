import { AnyExtension, getLazyArray, isRemirrorManager, RemirrorManager } from '@remirror/core';
import { corePreset } from '@remirror/preset-core';
import { ReactExtension } from '@remirror/preset-react';

import type { CreateReactManagerOptions, ReactExtensionUnion } from './react-types';

/**
 * Create a React [[`RemirrorManager`]] with all the default react presets and
 * extensions.
 */
export function createReactManager<ExtensionUnion extends AnyExtension>(
  extensions:
    | ExtensionUnion[]
    | (() => ExtensionUnion[])
    | RemirrorManager<ReactExtensionUnion<ExtensionUnion>>,
  options: CreateReactManagerOptions = {},
): RemirrorManager<ReactExtensionUnion<ExtensionUnion>> {
  const { core, react, ...settings } = options;

  if (isRemirrorManager<ReactExtensionUnion<ExtensionUnion>>(extensions)) {
    return extensions;
  }

  return RemirrorManager.create(
    () => [...getLazyArray(extensions), new ReactExtension(react), ...corePreset(core)],
    settings,
  );
}
