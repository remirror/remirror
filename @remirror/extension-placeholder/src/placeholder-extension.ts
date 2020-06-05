import {
  CreatePluginReturn,
  CustomHandlerKeyList,
  DefaultExtensionOptions,
  getPluginState,
  HandlerKeyList,
  isDocNodeEmpty,
  OnSetOptionsParameter,
  PlainExtension,
  Static,
  StaticKeyList,
  Transaction,
} from '@remirror/core';
import { EditorState } from '@remirror/pm/state';
import { Decoration, DecorationSet } from '@remirror/pm/view';

/**
 * Used to denote a node is empty.
 *
 * Currently used by the placeholder extension.
 */
export const EMPTY_NODE_CLASS_NAME = 'is-empty' as const;
export const EMPTY_NODE_CLASS_SELECTOR = `.${EMPTY_NODE_CLASS_NAME}`;

export interface PlaceholderOptions {
  /**
   * The placeholder text to use.
   */
  placeholder?: string;

  /**
   * The class to decorate the empty top level node with.
   */
  emptyNodeClass?: Static<string>;
}

export interface PlaceholderPluginState extends Required<PlaceholderOptions> {
  empty: boolean;
}

export interface PlaceholderOptions {}

/**
 * An extension for the remirror editor. CHANGE ME.
 */
export class PlaceholderExtension extends PlainExtension<PlaceholderOptions> {
  public static readonly staticKeys: StaticKeyList<PlaceholderOptions> = ['emptyNodeClass'];
  public static readonly handlerKeys: HandlerKeyList<PlaceholderOptions> = [];
  public static readonly customHandlerKeys: CustomHandlerKeyList<PlaceholderOptions> = [];

  public static readonly defaultOptions: DefaultExtensionOptions<PlaceholderOptions> = {
    emptyNodeClass: EMPTY_NODE_CLASS_NAME,
    placeholder: '',
  };

  get name() {
    return 'placeholder' as const;
  }

  public createAttributes = () => {
    return { 'aria-placeholder': this.options.placeholder };
  };

  public createPlugin = (): CreatePluginReturn => {
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
  };

  public onSetOptions(parameter: OnSetOptionsParameter<PlaceholderOptions>) {
    const { changes } = parameter;

    if (changes.placeholder) {
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
