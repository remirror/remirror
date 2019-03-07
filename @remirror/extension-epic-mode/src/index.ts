import { EditorSchema, Extension, getPluginState } from '@remirror/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { defaultEffect, ParticleEffect } from './effects';
import { EpicModePluginState } from './state';

export interface EpicModeOptions {
  /**
   * The particle effect to use
   */
  particleEffect?: ParticleEffect;

  /**
   * Where in the dom the canvas element should be stored
   */
  canvasHolder?: HTMLElement;
}

export class EpicMode extends Extension<EpicModeOptions> {
  get name(): 'epicMode' {
    return 'epicMode';
  }

  get defaultOptions() {
    return {
      particleEffect: defaultEffect,
      canvasHolder: document.body,
    };
  }

  public plugin() {
    const { particleEffect, canvasHolder } = this.options;
    return createEpicModePlugin({ key: this.pluginKey, particleEffect, canvasHolder });
  }
}

interface CreateEpicModePluginParams {
  key: PluginKey;
  particleEffect: ParticleEffect;
  canvasHolder: HTMLElement;
}

const createEpicModePlugin = ({ key, particleEffect, canvasHolder }: CreateEpicModePluginParams) => {
  const plugin = new Plugin<EpicModePluginState, EditorSchema>({
    key,
    state: {
      init() {
        return new EpicModePluginState({ particleEffect });
      },
      apply(_tr, pluginState) {
        return pluginState;
      },
    },
    view(view) {
      const pluginState = getPluginState<EpicModePluginState>(key, view.state).init(view, canvasHolder);

      return {
        destroy() {
          canvasHolder.removeChild(pluginState.canvas);
          pluginState.destroy();
        },
      };
    },
  });
  return plugin;
};
