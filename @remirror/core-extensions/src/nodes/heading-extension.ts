import {
  Attrs,
  CommandNodeTypeParams,
  ExtensionManagerNodeTypeParams,
  KeyboardBindings,
  NodeExtension,
  NodeExtensionOptions,
  NodeExtensionSpec,
  NodeGroup,
  ProsemirrorNode,
  toggleBlockItem,
} from '@remirror/core';
import { setBlockType } from 'prosemirror-commands';
import { textblockTypeInputRule } from 'prosemirror-inputrules';

export interface HeadingExtensionOptions extends NodeExtensionOptions {
  levels?: number[];
  defaultLevel?: number;
}

export type HeadingExtensionAttrs = Attrs<{
  /**
   * The heading size.
   */
  level?: number;
}>;

export const defaultHeadingExtensionOptions = {
  levels: [1, 2, 3, 4, 5, 6],
  defaultLevel: 1,
};

export class HeadingExtension extends NodeExtension<HeadingExtensionOptions> {
  get name() {
    return 'heading' as const;
  }

  get defaultOptions() {
    return defaultHeadingExtensionOptions;
  }

  get schema(): NodeExtensionSpec {
    return {
      attrs: {
        ...this.extraAttrs(null),
        level: {
          default: this.options.defaultLevel,
        },
      },
      content: 'inline*',
      group: NodeGroup.Block,
      defining: true,
      draggable: false,
      parseDOM: this.options.levels.map(level => ({
        tag: `h${level}`,
        attrs: { level },
      })),
      toDOM: (node: ProsemirrorNode) => {
        if (!this.options.levels.includes(node.attrs.level)) {
          // Use the first level available
          return [`h${this.options.defaultLevel}`, 0];
        }

        return [`h${node.attrs.level}`, 0];
      },
    };
  }

  public commands({ type, schema }: CommandNodeTypeParams) {
    return {
      /**
       * Toggle the heading for the current block.
       */
      toggleHeading: (attrs?: HeadingExtensionAttrs) =>
        toggleBlockItem({ type, toggleType: schema.nodes.paragraph, attrs }),
    };
  }

  public keys({ type }: ExtensionManagerNodeTypeParams) {
    const keys: KeyboardBindings = {};

    this.options.levels.forEach(level => {
      keys[`Shift-Ctrl-${level}`] = setBlockType(type, { level });
    });
    return keys;
  }

  public inputRules({ type }: ExtensionManagerNodeTypeParams) {
    return this.options.levels.map(level =>
      textblockTypeInputRule(new RegExp(`^(#{1,${level}})\\s$`), type, () => ({ level })),
    );
  }
}
