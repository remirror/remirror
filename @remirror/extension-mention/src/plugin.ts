import { EditorSchema, Extension, getPluginState } from '@remirror/core';
import { Plugin } from 'prosemirror-state';
import { SuggestionState } from './state';
import { MentionOptions } from './types';

export const createSuggestionsPlugin = (extension: Extension<MentionOptions>) => {
  type PluginState = SuggestionState;

  return new Plugin<PluginState, EditorSchema>({
    key: extension.pluginKey,
    /** Handle the plugin view */
    view(view) {
      const state = getPluginState<PluginState>(extension.pluginKey, view.state);
      return state.init(view).viewHandler();
    },

    state: {
      /** Initialize the state */
      init() {
        return new SuggestionState(extension);
      },

      /** Apply changes to the state */
      apply(tr, state: PluginState) {
        return state.apply(tr);
      },
    },

    props: {
      // Call the keydown hook if suggestion is active.
      handleKeyDown(view, event) {
        const state = getPluginState<PluginState>(extension.pluginKey, view.state);
        return state.handleKeyDown(event);
      },

      /**
       * Sets up a decoration (styling options) on the currently active decoration
       */
      decorations(editorState) {
        const state = getPluginState<PluginState>(extension.pluginKey, editorState);
        return state.decorations(editorState);
      },
    },
  });
};
