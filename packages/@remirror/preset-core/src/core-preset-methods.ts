import { AnyCombinedUnion, getArray, RemirrorManager } from '@remirror/core';

import { CorePreset, CorePresetOptions } from './core-preset';

export interface CreateCoreManagerOptions {
  /**
   * The core preset options.
   */
  core?: CorePresetOptions;

  /**
   * The manager settings.
   */
  managerSettings?: Remirror.ManagerSettings;
}

/**
 * Create a manager with the core preset already applied.
 */
export function createCoreManager<Combined extends AnyCombinedUnion>(
  combined: Combined[] | (() => Combined[]),
  options: CreateCoreManagerOptions = {},
) {
  const { core, managerSettings } = options;

  return RemirrorManager.create(
    () => [...getArray(combined), new CorePreset(core)],
    managerSettings,
  );
}
