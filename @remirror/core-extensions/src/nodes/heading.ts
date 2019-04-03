import {
  Attrs,
  KeyboardBindings,
  NodeExtension,
  NodeExtensionOptions,
  NodeExtensionSpec,
  ProsemirrorNode,
  SchemaNodeTypeParams,
  toggleBlockItem,
} from '@remirror/core';
import { setBlockType } from 'prosemirror-commands';
import { textblockTypeInputRule } from 'prosemirror-inputrules';

export interface HeadingOptions extends NodeExtensionOptions {
  levels?: number[];
  defaultLevel?: number;
}

export class Heading extends NodeExtension<HeadingOptions> {
  get name() {
    return 'heading' as const;
  }

  get defaultOptions() {
    return {
      levels: [1, 2, 3, 4, 5, 6],
      defaultLevel: 1,
    };
  }

  get schema(): NodeExtensionSpec {
    return {
      attrs: {
        level: {
          default: this.options.defaultLevel,
        },
        ...this.extraAttrs(),
      },
      content: 'inline*',
      group: 'block',
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

  public commands({ type, schema }: SchemaNodeTypeParams) {
    return (attrs?: Attrs) => toggleBlockItem({ type, toggleType: schema.nodes.paragraph, attrs });
  }

  public keys({ type }: SchemaNodeTypeParams) {
    const keys: KeyboardBindings = {};

    this.options.levels.forEach(level => {
      keys[`Shift-Ctrl-${level}`] = setBlockType(type, { level });
    });
    return keys;
  }

  public inputRules({ type }: SchemaNodeTypeParams) {
    return this.options.levels.map(level =>
      textblockTypeInputRule(new RegExp(`^(#{1,${level}})\\s$`), type, () => ({ level })),
    );
  }
}
