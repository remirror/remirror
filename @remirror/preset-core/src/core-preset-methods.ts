import { AnyCombinedUnion, RemirrorManager } from '@remirror/core';

import { CorePreset, CorePresetOptions } from './core-preset';

export interface CreateCoreManagerOptions {
  /**
   * The core preset options.
   */
  core?: CorePresetOptions;

  /**
   * The manager settings.
   */
  settings?: Remirror.ManagerSettings;
}

/**
 * Create a core manager.
 */
export function createCoreManager<Combined extends AnyCombinedUnion>(
  combined: readonly Combined[],
  options: CreateCoreManagerOptions,
) {
  const { core, settings } = options;
  return RemirrorManager.create([...combined, new CorePreset(core)], settings);
}
