import { EditorSchema, Extension, getPluginState } from '@remirror/core';
import { Plugin } from 'prosemirror-state';

import { EpicModePluginState } from './epic-mode-state';
import { EpicModeExtensionOptions } from './epic-mode-types';

/**
 * Create the epic mode plugin responsible for unleashing the epic-ness!
 */
export const createEpicModePlugin = (ctx: Extension<EpicModeExtensionOptions>) => {
  return new Plugin<EpicModePluginState, EditorSchema>({
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
};
