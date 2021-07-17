import {
  CreateExtensionPlugin,
  extension,
  isDefaultDocNode,
  ManagerPhase,
  OnSetOptionsProps,
  PlainExtension,
  ProsemirrorAttributes,
  Transaction,
} from '@remirror/core';
import type { EditorState } from '@remirror/pm/state';
import { Decoration, DecorationSet } from '@remirror/pm/view';
import { ExtensionPlaceholderTheme } from '@remirror/theme';

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
 * The placeholder extension which adds a placeholder annotation to an empty
 * document.
 */
@extension<PlaceholderOptions>({
  defaultOptions: {
    emptyNodeClass: ExtensionPlaceholderTheme.IS_EMPTY,
    placeholder: '',
  },
})
export class PlaceholderExtension extends PlainExtension<PlaceholderOptions> {
  get name() {
    return 'placeholder' as const;
  }

  createAttributes(): ProsemirrorAttributes {
    return { 'aria-placeholder': this.options.placeholder };
  }

  createPlugin(): CreateExtensionPlugin {
    return {
      state: {
        init: (_, state): PlaceholderPluginState => ({
          ...this.options,
          empty: isDefaultDocNode(state.doc, { ignoreAttributes: true }),
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

  protected onSetOptions(props: OnSetOptionsProps<PlaceholderOptions>): void {
    const { changes } = props;

    if (changes.placeholder.changed && this.store.phase >= ManagerPhase.EditorView) {
      // update the attributes object
      this.store.updateAttributes();
    }
  }
}

interface SharedProps {
  /**
   * A reference to the extension
   */
  extension: PlaceholderExtension;
  /**
   * The editor state
   */
  state: EditorState;
}

interface ApplyStateProps extends SharedProps {
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
 * @param props
 */
function applyState(props: ApplyStateProps) {
  const { pluginState, extension, tr, state } = props;

  if (!tr.docChanged) {
    return pluginState;
  }

  return { ...extension.options, empty: isDefaultDocNode(state.doc) };
}

/**
 * Creates a decoration set from the passed through state.
 *
 * @param props - see [[`SharedProps`]]
 */
function createDecorationSet(props: SharedProps) {
  const { extension, state } = props;
  const { empty } = extension.pluginKey.getState(state) as PlaceholderPluginState;
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

declare global {
  namespace Remirror {
    interface AllExtensions {
      placeholder: PlaceholderExtension;
    }
  }
}
