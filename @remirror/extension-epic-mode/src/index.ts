import { EditorSchema, Extension, getPluginState } from '@remirror/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import {
  COLORS,
  defaultEffect,
  heartEffect,
  PARTICLE_NUM_RANGE,
  spawningEffect,
  VIBRANT_COLORS,
} from './effects';
import { EpicModePluginState } from './state';
import {
  CreateParticleParams,
  EpicModeOptions,
  EpicModePluginStateParams,
  Particle,
  ParticleEffect,
  ParticleRange,
  UpdateParticleParams,
} from './types';

export class EpicMode extends Extension<EpicModeOptions> {
  get name(): 'epicMode' {
    return 'epicMode';
  }

  get defaultOptions() {
    return {
      particleEffect: defaultEffect,
      canvasHolder: document.body,
      colors: VIBRANT_COLORS,
      particleRange: PARTICLE_NUM_RANGE,
      shake: true,
      shakeTime: 0.3,
    };
  }

  public plugin() {
    const { particleEffect, canvasHolder, colors, particleRange, shake, shakeTime } = this.options;
    return createEpicModePlugin({
      key: this.pluginKey,
      particleEffect,
      canvasHolder,
      colors,
      particleRange,
      shake,
      shakeTime,
    });
  }
}

interface CreateEpicModePluginParams extends Required<EpicModeOptions> {
  key: PluginKey;
}

const createEpicModePlugin = ({ key, ...rest }: CreateEpicModePluginParams) => {
  const plugin = new Plugin<EpicModePluginState, EditorSchema>({
    key,
    state: {
      init() {
        return new EpicModePluginState(rest);
      },
      apply(_tr, pluginState) {
        return pluginState;
      },
    },
    props: {
      handleKeyPress(view) {
        const pluginState = getPluginState<EpicModePluginState>(key, view.state);
        pluginState.shake(rest.shakeTime);
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

export type EpicModePluginState = typeof EpicModePluginState;

export {
  defaultEffect,
  spawningEffect,
  heartEffect,
  EpicModeOptions,
  ParticleEffect,
  Particle,
  ParticleRange,
  UpdateParticleParams,
  CreateParticleParams,
  EpicModePluginStateParams,
  COLORS,
  VIBRANT_COLORS,
};
