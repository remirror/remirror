import { EditorSchema, Extension, getPluginKeyState, getPluginState } from '@remirror/core';
import { random, throttle } from 'lodash';
import { EditorState, Plugin, PluginKey } from 'prosemirror-state';
import { EpicModePluginState } from './state';

export class EpicMode extends Extension {
  get name(): 'epicMode' {
    return 'epicMode';
  }
  get defaultOptions() {
    return {};
  }

  public plugin() {
    return createEpicModePlugin({ key: this.pluginKey });
  }
}

interface CreateEpicModePluginParams {
  key: PluginKey;
}

const createEpicModePlugin = ({ key }: CreateEpicModePluginParams) => {
  const plugin = new Plugin<EpicModePluginState, EditorSchema>({
    key,
    state: {
      init() {
        return new EpicModePluginState();
      },
      apply(_tr, pluginState) {
        return pluginState;
      },
    },
    view(view) {
      const pluginState = getPluginState<EpicModePluginState>(key, view.state);
      view.dom.appendChild(pluginState.canvas);

      return {
        destroy() {
          view.dom.removeChild(pluginState.canvas);
        },
      };
    },
  });
  return plugin;
};
