import { Extension } from '@remirror/core';
import { EditorSchema, EditorView, Transaction } from '@remirror/core-types';
import { getPluginMeta, getPluginState, isDocNodeEmpty, setPluginMeta } from '@remirror/core-utils';
import { EditorState, Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import {
  PlaceholderExtensionOptions,
  PlaceholderPluginMeta,
  PlaceholderPluginState,
} from '../../core-extension-types';

/**
 * Create the placeholder plugin
 *
 * @param extension
 */
export const createPlaceholderPlugin = (extension: Extension<PlaceholderExtensionOptions>) => {
  return new Plugin<PlaceholderPluginState, EditorSchema>({
    key: extension.pluginKey,
    state: {
      init: (_, state): PlaceholderPluginState => ({
        ...extension.options,
        empty: isDocNodeEmpty(state.doc),
      }),
      apply: (tr, pluginState: PlaceholderPluginState, _, state): PlaceholderPluginState => {
        return applyState({ pluginState, tr, extension, state });
      },
    },
    props: {
      decorations: state => {
        return createDecorationSet({ state, extension });
      },

      /**
       * TODO this may no longer be needed since `prosemirror-view@1.9.x`
       * Borrowed from `atlaskit`
       * Workaround: On Mobile / Android, a user can start typing but it won't trigger
       * an Editor state update so the placeholder will still be shown. We hook into the compositionstart
       * and compositionend events instead, to make sure we show/hide the placeholder for these devices.
       */
      handleDOMEvents: {
        compositionstart: view => {
          return onCompositionStart({ state: view.state, dispatch: view.dispatch, extension });
        },
        compositionend: view => {
          return onCompositionEnd({ state: view.state, dispatch: view.dispatch, extension });
        },
      },
    },
  });
};

interface SharedParams {
  /** The placeholder extension */
  extension: Extension<PlaceholderExtensionOptions>;
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
  const meta = getPluginMeta<PlaceholderPluginMeta>(extension.pluginKey, tr);

  if (meta) {
    if (meta.removePlaceholder) {
      return { ...extension.options, empty: false };
    }

    if (meta.applyPlaceholderIfEmpty) {
      return { ...extension.options, empty: isDocNodeEmpty(state.doc) };
    }
  }

  if (!tr.docChanged) {
    return pluginState;
  }

  return { ...extension.options, empty: isDocNodeEmpty(state.doc) };
};

/**
 * Creates a decoration set from the passed through state
 *
 * @param params.extension
 * @param params.state
 */
const createDecorationSet = ({ extension, state }: SharedParams) => {
  const { empty } = getPluginState<PlaceholderPluginState>(extension.pluginKey, state);
  const { emptyNodeClass, placeholder } = extension.options;

  if (!empty) {
    return;
  }
  const decorations: Decoration[] = [];
  state.doc.descendants((node, pos) => {
    const decoration = Decoration.node(pos, pos + node.nodeSize, {
      class: emptyNodeClass,
      // @ts-ignore
      'data-placeholder': placeholder,
    });
    decorations.push(decoration);
  });

  return DecorationSet.create(state.doc, decorations);
};

interface CompositionParams extends SharedParams {
  dispatch: EditorView['dispatch'];
}

/**
 * When a composition starts make sure the placeholder is removed via setting the plugin meta data
 *
 * @param params.extension
 * @param params.state
 * @param params.dispatch
 */
const onCompositionStart = ({ state, dispatch, extension }: CompositionParams) => {
  const { empty } = getPluginState(extension.pluginKey, state);

  if (empty) {
    // remove placeholder, since document definitely contains text
    dispatch(setPluginMeta(extension.pluginKey, state.tr, { removePlaceholder: true }));
  }

  return false;
};

/**
 * When a composition ends pass the information on via the plugin meta data
 *
 * @param params.extension
 * @param params.state
 * @param params.dispatch
 */
const onCompositionEnd = ({ state, dispatch, extension }: CompositionParams) => {
  const { empty } = getPluginState(extension.pluginKey, state);

  if (!empty) {
    dispatch(
      setPluginMeta(extension.pluginKey, state.tr, {
        applyPlaceholderIfEmpty: true,
      }),
    );
  }

  return false;
};
