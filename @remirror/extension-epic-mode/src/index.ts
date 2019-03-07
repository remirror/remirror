import { EditorSchema, Extension, getPluginState } from '@remirror/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { COLORS, defaultEffect, PARTICLE_NUM_RANGE, spawningEffect } from './effects';
import { EpicModePluginState } from './state';
import { EpicModeOptions, Particle, ParticleEffect, ParticleRange } from './types';

export class EpicMode extends Extension<EpicModeOptions> {
  get name(): 'epicMode' {
    return 'epicMode';
  }

  get defaultOptions() {
    return {
      particleEffect: defaultEffect,
      canvasHolder: document.body,
      colors: COLORS,
      particleRange: PARTICLE_NUM_RANGE,
    };
  }

  public plugin() {
    const { particleEffect, canvasHolder, colors, particleRange } = this.options;
    return createEpicModePlugin({ key: this.pluginKey, particleEffect, canvasHolder, colors, particleRange });
  }
}

interface CreateEpicModePluginParams extends Required<EpicModeOptions> {
  key: PluginKey;
}

const createEpicModePlugin = ({
  key,
  particleEffect,
  canvasHolder,
  colors,
  particleRange,
}: CreateEpicModePluginParams) => {
  const plugin = new Plugin<EpicModePluginState, EditorSchema>({
    key,
    state: {
      init() {
        return new EpicModePluginState({ particleEffect, colors, particleRange, canvasHolder });
      },
      apply(_tr, pluginState) {
        return pluginState;
      },
    },
    props: {
      handleKeyPress(view) {
        const pluginState = getPluginState<EpicModePluginState>(key, view.state);
        pluginState.shake(1);
        pluginState.spawnParticles();
        return false;
      },
    },
    view(view) {
      const pluginState = getPluginState<EpicModePluginState>(key, view.state).init(view);

      return {
        destroy() {
          pluginState.destroy();
        },
      };
    },
  });
  return plugin;
};

export { defaultEffect, spawningEffect, EpicModeOptions, ParticleEffect, Particle, ParticleRange };
export type EpicModePluginState = typeof EpicModePluginState;
