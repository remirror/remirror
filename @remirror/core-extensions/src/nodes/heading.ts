import {
  Attrs,
  NodeExtension,
  NodeExtensionOptions,
  NodeExtensionSpec,
  PMNode,
  SchemaNodeTypeParams,
  setBlockType,
  textBlockTypeInputRule,
  toggleBlockItem,
} from '@remirror/core';

export interface HeadingOptions extends NodeExtensionOptions {
  levels: number[];
}

export class Heading extends NodeExtension<HeadingOptions> {
  get name(): 'heading' {
    return 'heading';
  }

  get defaultOptions() {
    return {
      levels: [1, 2, 3, 4, 5, 6],
    };
  }

  get schema(): NodeExtensionSpec {
    return {
      attrs: {
        level: {
          default: 1,
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
      toDOM: (node: PMNode) => [`h${node.attrs.level}`, 0],
    };
  }

  public commands({ type, schema }: SchemaNodeTypeParams) {
    return (attrs?: Attrs) => toggleBlockItem(type, schema.nodes.paragraph, attrs);
  }

  public keys({ type }: SchemaNodeTypeParams) {
    return this.options.levels.reduce(
      (items, level) => ({
        ...items,
        ...{
          [`Shift-Ctrl-${level}`]: setBlockType(type, { level }),
        },
      }),
      {},
    );
  }

  public inputRules({ type }: SchemaNodeTypeParams) {
    return this.options.levels.map(level =>
      textBlockTypeInputRule(new RegExp(`^(#{1,${level}})\\s$`), type, () => ({ level })),
    );
  }
}
