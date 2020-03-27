import { setBlockType } from 'prosemirror-commands';
import { textblockTypeInputRule } from 'prosemirror-inputrules';

import {
  Attrs,
  CommandNodeTypeParams,
  convertCommand,
  ExtensionManagerNodeTypeParams,
  KeyBindings,
  NodeExtension,
  NodeExtensionConfig,
  NodeExtensionSpec,
  NodeGroup,
  object,
  ProsemirrorNode,
  toggleBlockItem,
} from '@remirror/core';

export interface HeadingExtensionOptions extends NodeExtensionConfig {
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
      parseDOM: this.options.levels.map((level) => ({
        tag: `h${level}`,
        attrs: { level },
      })),
      toDOM: (node: ProsemirrorNode) => {
        if (!this.options.levels.includes(node.attrs.level)) {
          // Use the first level available
          return [`h${this.options.defaultLevel}`, 0];
        }

        return [`h${node.attrs.level as string}`, 0];
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

  public keys({ type }: ExtensionManagerNodeTypeParams): KeyBindings {
    const keys: KeyBindings = object();

    this.options.levels.forEach((level) => {
      keys[`Shift-Ctrl-${level}`] = convertCommand(setBlockType(type, { level }));
    });
    return keys;
  }

  public inputRules({ type }: ExtensionManagerNodeTypeParams) {
    return this.options.levels.map((level) =>
      textblockTypeInputRule(new RegExp(`^(#{1,${level}})\\s$`), type, () => ({ level })),
    );
  }
}
