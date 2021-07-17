import { AnyExtension, getLazyArray, isRemirrorManager, RemirrorManager } from '@remirror/core';
import { corePreset } from '@remirror/preset-core';
import { ReactExtension } from '@remirror/preset-react';

import type { CreateReactManagerOptions, ReactExtensions } from './react-types';

/**
 * Create a React [[`RemirrorManager`]] with all the default react presets and
 * extensions.
 */
export function createReactManager<Extension extends AnyExtension>(
  extensions: Extension[] | (() => Extension[]) | RemirrorManager<ReactExtensions<Extension>>,
  options: CreateReactManagerOptions = {},
): RemirrorManager<ReactExtensions<Extension>> {
  const { core, react, ...settings } = options;

  if (isRemirrorManager<ReactExtensions<Extension>>(extensions)) {
    return extensions;
  }

  return RemirrorManager.create(
    () => [...getLazyArray(extensions), new ReactExtension(react), ...corePreset(core)],
    settings,
  );
}
