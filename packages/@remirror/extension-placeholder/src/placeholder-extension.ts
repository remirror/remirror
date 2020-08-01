import { css } from 'linaria';

import {
  CreatePluginReturn,
  extensionDecorator,
  getPluginState,
  isDocNodeEmpty,
  ManagerPhase,
  OnSetOptionsParameter,
  PlainExtension,
  Transaction,
} from '@remirror/core';
import type { EditorState } from '@remirror/pm/state';
import { Decoration, DecorationSet } from '@remirror/pm/view';

const isEmptyStyles = css`
  &:first-of-type::before {
    position: absolute;
    color: #aaa;
    pointer-events: none;
    height: 0;
    font-style: italic;
    content: attr(data-placeholder);
  }
`;

/**
 * Used to denote a node is empty.
 *
 * Currently used by the placeholder extension.
 */
export const EMPTY_NODE_CLASS_NAME = isEmptyStyles;
export const EMPTY_NODE_CLASS_SELECTOR = `.${EMPTY_NODE_CLASS_NAME}`;

export interface PlaceholderOptions {
  /**
   * The placeholder text to use.
   */
  placeholder?: string;

  /**
   * The class to decorate the empty top level node with. If you change this
   * then you will also need to apply your own styles.
   */
  emptyNodeClass?: string;
}

export interface PlaceholderPluginState extends Required<PlaceholderOptions> {
  empty: boolean;
}

/**
 * An extension for the remirror editor. CHANGE ME.
 */
@extensionDecorator<PlaceholderOptions>({
  defaultOptions: {
    emptyNodeClass: EMPTY_NODE_CLASS_NAME,
    placeholder: '',
  },
})
export class PlaceholderExtension extends PlainExtension<PlaceholderOptions> {
  get name() {
    return 'placeholder' as const;
  }

  createAttributes() {
    return { 'aria-placeholder': this.options.placeholder };
  }

  createPlugin(): CreatePluginReturn {
    return {
      state: {
        init: (_, state): PlaceholderPluginState => ({
          ...this.options,
          empty: isDocNodeEmpty(state.doc),
        }),
        apply: (tr, pluginState: PlaceholderPluginState, _, state): PlaceholderPluginState => {
          return applyState({ pluginState, tr, extension: this, state });
        },
      },
      props: {
        decorations: (state) => {
          return createDecorationSet({ state, extension: this });
        },
      },
    };
  }

  onSetOptions(parameter: OnSetOptionsParameter<PlaceholderOptions>) {
    const { changes } = parameter;

    if (changes.placeholder.changed && this.store.phase >= ManagerPhase.EditorView) {
      // update the attributes object
      this.store.updateAttributes();
    }
  }
}

interface SharedParameter {
  /**
   * A reference to the extension
   */
  extension: PlaceholderExtension;
  /**
   * The editor state
   */
  state: EditorState;
}

interface ApplyStateParameter extends SharedParameter {
  /**
   * The plugin state passed through to apply
   */
  pluginState: PlaceholderPluginState;
  /**
   * A state transaction
   */
  tr: Transaction;
}

/**
 * Apply state for managing the created placeholder plugin.
 *
 * @param params
 */
function applyState({ pluginState, extension, tr, state }: ApplyStateParameter) {
  if (!tr.docChanged) {
    return pluginState;
  }

  return { ...extension.options, empty: isDocNodeEmpty(state.doc) };
}

/**
 * Creates a decoration set from the passed through state
 *
 * @param params.extension
 * @param params.state
 */
function createDecorationSet({ extension, state }: SharedParameter) {
  const { empty } = getPluginState<PlaceholderPluginState>(extension.pluginKey, state);
  const { emptyNodeClass, placeholder } = extension.options;

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
}
