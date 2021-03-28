import direction from 'direction';
import type {
  AcceptUndefined,
  CommandFunction,
  CreateExtensionPlugin,
  IdentifierSchemaAttributes,
  OnSetOptionsProps,
  PrimitiveSelection,
  ProsemirrorAttributes,
  SchemaAttributesObject,
  Selection,
  Static,
} from '@remirror/core';
import {
  command,
  extension,
  ExtensionTag,
  findParentNode,
  getTextSelection,
  hasTransactionChanged,
  isString,
  PlainExtension,
} from '@remirror/core';
import { ExtensionBidiMessages } from '@remirror/messages';

const setTextDirectionOptions: Remirror.CommandDecoratorOptions = {
  icon: ({ attrs }) => (attrs?.dir === 'ltr' ? 'textDirectionL' : 'textDirectionR'),
  description: ({ t, attrs }) => t(ExtensionBidiMessages.DESCRIPTION, { dir: attrs?.dir }),
  label: ({ t, attrs }) => t(ExtensionBidiMessages.LABEL, { dir: attrs?.dir }),
};

export interface BidiOptions {
  /**
   * This is the direction that is used when the algorithm is not quite sure.
   */
  defaultDirection?: AcceptUndefined<'ltr' | 'rtl'>;

  /**
   * Whether or not the extension should automatically infer the direction as you type.
   *
   * @default false
   */
  autoUpdate?: boolean;

  /**
   * The names of the nodes to exclude.
   *
   * @default []
   */
  excludeNodes?: Static<string[]>;
}

/**
 * An extension which adds bi-directional text support to your editor. This is
 * the best way to support languages which are read from right-to-left.
 */
@extension<BidiOptions>({
  defaultOptions: {
    defaultDirection: undefined,
    autoUpdate: false,
    excludeNodes: [],
  },
  staticKeys: ['excludeNodes'],
})
export class BidiExtension extends PlainExtension<BidiOptions> {
  get name() {
    return 'bidi' as const;
  }

  /**
   * Whether to ignore next updated.
   */
  private _ignoreNextUpdate = false;

  /**
   * Add the bidi property to the top level editor attributes `doc`.
   */
  createAttributes(): ProsemirrorAttributes {
    if (this.options.defaultDirection) {
      return {
        dir: this.options.defaultDirection,
      };
    }

    return {};
  }

  /**
   * Add the `dir` to all the inner node types.
   */
  createSchemaAttributes(): IdentifierSchemaAttributes[] {
    const IGNORE_BIDI_AUTO_UPDATE = 'data-ignore-bidi-auto';
    return [
      {
        identifiers: {
          type: 'node',
          tags: [ExtensionTag.BlockNode],
          excludeNames: this.options.excludeNodes,
        },
        attributes: {
          dir: this.dir(),
          ignoreBidiAutoUpdate: {
            default: null,
            parseDOM: IGNORE_BIDI_AUTO_UPDATE,
            toDOM: (attrs) =>
              attrs.ignoreBidiAutoUpdate ? [IGNORE_BIDI_AUTO_UPDATE, 'true'] : undefined,
          },
        },
      },
    ];
  }

  /**
   * Create the plugin that ensures the node has the correct `dir` value on each
   * state update.
   */
  createPlugin(): CreateExtensionPlugin<boolean> {
    return {
      state: {
        init: () => false,
        apply: (tr) => {
          if (this._ignoreNextUpdate) {
            this._ignoreNextUpdate = false;
            return false;
          }

          return hasTransactionChanged(tr);
        },
      },
      appendTransaction: (_, __, state) => {
        const shouldUpdate = this.getPluginState<boolean>();
        const { autoUpdate, excludeNodes } = this.options;
        const tr = state.tr;

        if (!shouldUpdate || !autoUpdate) {
          return;
        }

        const parent = findParent(state.selection, excludeNodes);

        if (!parent) {
          return;
        }

        const { node, pos } = parent;

        const currentDirection = node.attrs.dir;
        const dir = this.getDirection(node.textContent);

        if (currentDirection === dir) {
          return;
        }

        if (node.attrs.ignoreBidiAutoUpdate) {
          return;
        }

        this._ignoreNextUpdate = true;
        return this.store
          .chain(tr)
          .updateNodeAttributes(pos, { ...node.attrs, dir })
          .tr();
      },
    };
  }

  protected onSetOptions(props: OnSetOptionsProps<BidiOptions>): void {
    const { changes } = props;

    if (changes.defaultDirection.changed) {
      this.store.updateAttributes();
    }
  }

  /**
   * Create the `SchemaAttributesObject`
   */
  private dir(): SchemaAttributesObject {
    return {
      default: this.options.defaultDirection ?? null,
      parseDOM: (element) => element.getAttribute('dir') ?? this.getDirection(element.textContent),
      toDOM: (_, { node }) => {
        if (!node) {
          return;
        }

        if (!node.textContent) {
          return;
        }

        return this.getDirection(node.textContent) ?? this.options.defaultDirection;
      },
    };
  }

  /**
   * Get the direction of the text.
   */
  private getDirection(text: string | undefined | null) {
    if (!isString(text)) {
      return;
    }

    const dir = direction(text);

    if (dir === 'neutral') {
      return this.options.defaultDirection;
    }

    return dir;
  }

  @command(setTextDirectionOptions)
  setTextDirection(
    dir: 'ltr' | 'rtl' | undefined,
    options: SetTextDirectionOptions = {},
  ): CommandFunction {
    return (props) => {
      const { tr } = props;
      const { selection } = options;
      const cmd = this.store.commands.updateNodeAttributes.original;
      const parent = findParent(
        getTextSelection(selection ?? tr.selection, tr.doc),
        this.options.excludeNodes,
      );

      // eslint-disable-next-line eqeqeq
      if (!parent || parent.node.attrs.dir == dir) {
        return false;
      }

      return cmd(parent.pos, { dir, ignoreBidiAutoUpdate: dir ? true : dir })(props);
    };
  }
}

function findParent(selection: Selection, excludeNodes: string[]) {
  return findParentNode({
    predicate: (node) =>
      !!(node.isTextblock && node.textContent && !excludeNodes.includes(node.type.name)),
    selection,
  });
}

interface SetTextDirectionOptions {
  selection?: PrimitiveSelection;
}

declare global {
  namespace Remirror {
    interface Attributes {
      /**
       * This attribute grants control over bidirectional language support.
       */
      dir?: 'ltr' | 'rtl';

      /**
       * When truthy this should set the node to ignore any updates to the
       * direction of the text.
       */
      ignoreBidiAutoUpdate?: boolean;
    }

    interface AllExtensions {
      bidi: BidiExtension;
    }
  }
}
