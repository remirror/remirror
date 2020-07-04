import { AnyCombinedUnion, BuiltinPreset, RemirrorManager } from '@remirror/core';
import { CorePreset } from '@remirror/preset-core';
import { ReactPreset } from '@remirror/preset-react';

import { CreateReactManagerOptions } from './react-types';

/**
 * Create a react manager with all the default react presets and extensions.
 */
export function createReactManager<Combined extends AnyCombinedUnion>(
  combined: readonly Combined[],
  options: CreateReactManagerOptions = {},
): RemirrorManager<Combined | BuiltinPreset | ReactPreset | CorePreset> {
  const { managerSettings: settings, core, react } = options;

  return RemirrorManager.create(
    [...combined, new ReactPreset(react), new CorePreset(core)],
    settings,
  );
}
