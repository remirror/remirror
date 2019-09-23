import { EditorSchema, Extension, getPluginState, ProsemirrorPlugin } from '@remirror/core';
import { Plugin } from 'prosemirror-state';
import { defaultEffect, PARTICLE_NUM_RANGE, VIBRANT_COLORS } from './epic-mode-effects';
import { EpicModePluginState } from './epic-mode-state';
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

/**
 * Create the epic mode plugin responsible for unleashing the epic-ness!
 */
const createEpicModePlugin = (ctx: Extension<EpicModeExtensionOptions>) => {
  const plugin = new Plugin<EpicModePluginState, EditorSchema>({
    key: ctx.pluginKey,
    state: {
      init() {
        return new EpicModePluginState(ctx.options);
      },
      apply(_tr, pluginState) {
        return pluginState;
      },
    },

    props: {
      handleKeyPress(view) {
        const pluginState = getPluginState<EpicModePluginState>(ctx.pluginKey, view.state);
        pluginState.shake(ctx.options.shakeTime);
        pluginState.spawnParticles();
        return false;
      },
    },

    view(view) {
      const pluginState = getPluginState<EpicModePluginState>(ctx.pluginKey, view.state).init(view);

      return {
        destroy() {
          pluginState.destroy();
        },
      };
    },
  });
  return plugin;
};
