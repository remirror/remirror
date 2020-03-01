import { Extension, ProsemirrorPlugin } from '@remirror/core';

import { PARTICLE_NUM_RANGE, VIBRANT_COLORS, defaultEffect } from './epic-mode-effects';
import { createEpicModePlugin } from './epic-mode-plugin';
import { EpicModeExtensionOptions } from './epic-mode-types';

export const defaultEpicModeExtensionOptions: EpicModeExtensionOptions = {
  particleEffect: defaultEffect,
  getCanvasContainer: () => document.body,
  colors: VIBRANT_COLORS,
  particleRange: PARTICLE_NUM_RANGE,
  shake: true,
  shakeTime: 0.3,
};

export class EpicModeExtension extends Extension<EpicModeExtensionOptions> {
  get name() {
    return 'epicMode' as const;
  }

  get defaultOptions() {
    return defaultEpicModeExtensionOptions;
  }

  public plugin(): ProsemirrorPlugin {
    return createEpicModePlugin(this);
  }
}
