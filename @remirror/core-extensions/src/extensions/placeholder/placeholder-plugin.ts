import { EditorState, Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

import { AnyExtension } from '@remirror/core';
import { EditorSchema, Transaction } from '@remirror/core-types';
import { getPluginState, isDocNodeEmpty } from '@remirror/core-utils';

import { PlaceholderExtensionSettings, PlaceholderPluginState } from '../../core-extension-types';

interface SharedParams {
  /** The placeholder extension */
  extension: AnyExtension<PlaceholderExtensionSettings>;
  /** The editor state */
  state: EditorState;
}

interface ApplyStateParams extends SharedParams {
  /** The plugin state passed through to apply */
  pluginState: PlaceholderPluginState;
  /** A state transaction */
  tr: Transaction;
}

/**
 * Apply state for managing the created placeholder plugin
 *
 * @param params
 */
const applyState = ({ pluginState, extension, tr, state }: ApplyStateParams) => {
  if (!tr.docChanged) {
    return pluginState;
  }

  return { ...extension.settings, empty: isDocNodeEmpty(state.doc) };
};

/**
 * Creates a decoration set from the passed through state
 *
 * @param params.extension
 * @param params.state
 */
const createDecorationSet = ({ extension, state }: SharedParams) => {
  const { empty } = getPluginState<PlaceholderPluginState>(extension.pluginKey, state);
  const { emptyNodeClass, placeholder } = extension.settings;

  if (!empty) {
    return;
  }
  const decorations: Decoration[] = [];
  state.doc.descendants((node, pos) => {
    const decoration = Decoration.node(pos, pos + node.nodeSize, {
      class: emptyNodeClass,
      'data-placeholder': placeholder,
    });
    decorations.push(decoration);
  });

  return DecorationSet.create(state.doc, decorations);
};

/**
 * Create the placeholder plugin
 *
 * @param extension
 */
export const createPlaceholderPlugin = (extension: AnyExtension<PlaceholderExtensionSettings>) => {
  return new Plugin<PlaceholderPluginState, EditorSchema>({
    key: extension.pluginKey,
    state: {
      init: (_, state): PlaceholderPluginState => ({
        ...extension.settings,
        empty: isDocNodeEmpty(state.doc),
      }),
      apply: (tr, pluginState: PlaceholderPluginState, _, state): PlaceholderPluginState => {
        return applyState({ pluginState, tr, extension, state });
      },
    },
    props: {
      decorations: (state) => {
        return createDecorationSet({ state, extension });
      },
    },
  });
};
