import {
  AnyCombinedUnion,
  ErrorConstant,
  getLazyArray,
  invariant,
  isRemirrorManager,
  RemirrorManager,
} from '@remirror/core';
import { CorePreset } from '@remirror/preset-core';
import { ReactPreset } from '@remirror/preset-react';

import type { CreateReactManagerOptions, ReactCombinedUnion } from './react-types';

/**
 * Create a react manager with all the default react presets and extensions.
 */
export function createReactManager<Combined extends AnyCombinedUnion>(
  combined: Combined[] | (() => Combined[]) | RemirrorManager<ReactCombinedUnion<Combined>>,
  options: CreateReactManagerOptions = {},
): RemirrorManager<ReactCombinedUnion<Combined>> {
  const { core, react, ...settings } = options;

  if (isRemirrorManager<ReactCombinedUnion<Combined>>(combined)) {
    console.log(combined);
    invariant(combined.includes(['react', 'core']), {
      code: ErrorConstant.INVALID_MANAGER_EXTENSION,
      message:
        "The extensions and presets provided to the manager don't include the `CorePreset` or the `ReactPreset`. Please either create a manager which includes both, or use the `useManager` hook / `createReact` function.",
    });

    return combined;
  }

  return RemirrorManager.create(
    () => [...getLazyArray(combined), new ReactPreset(react), new CorePreset(core)],
    settings,
  );
}
