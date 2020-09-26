import {
  ApplySchemaAttributes,
  CommandFunction,
  extensionDecorator,
  ExtensionTag,
  InputRule,
  KeyBindings,
  NodeExtension,
  NodeExtensionSpec,
  object,
  ProsemirrorAttributes,
  ProsemirrorNode,
  setBlockType,
  Static,
  toggleBlockItem,
} from '@remirror/core';
import { textblockTypeInputRule } from '@remirror/pm/inputrules';

export interface HeadingOptions {
  /**
   * The numerical value of the supporting headings.
   *
   * @default [1, 2, 3, 4, 5, 6]
   */
  levels?: Static<number[]>;

  /**
   * The default level heading to use.
   *
   * @default 1
   */
  defaultLevel?: Static<number>;
}

export type HeadingExtensionAttributes = ProsemirrorAttributes<{
  /**
   * The heading size.
   */
  level?: number;
}>;

export interface HeadingOptions {}

@extensionDecorator<HeadingOptions>({
  defaultOptions: {
    levels: [1, 2, 3, 4, 5, 6],
    defaultLevel: 1,
  },
  staticKeys: ['defaultLevel', 'levels'],
})
export class HeadingExtension extends NodeExtension<HeadingOptions> {
  get name() {
    return 'heading' as const;
  }

  readonly tags = [ExtensionTag.BlockNode];

  createNodeSpec(extra: ApplySchemaAttributes): NodeExtensionSpec {
    return {
      attrs: {
        ...extra.defaults(),
        level: {
          default: this.options.defaultLevel,
        },
      },
      content: 'inline*',
      defining: true,
      draggable: false,
      parseDOM: this.options.levels.map((level) => ({
        tag: `h${level}`,
        getAttrs: (element) => ({ ...extra.parse(element), level }),
      })),
      toDOM: (node: ProsemirrorNode) => {
        if (!this.options.levels.includes(node.attrs.level)) {
          // Use the first level available
          return [`h${this.options.defaultLevel}`, extra.dom(node), 0];
        }

        return [`h${node.attrs.level as string}`, extra.dom(node), 0];
      },
    };
  }

  createCommands() {
    return {
      /**
       * Toggle the heading for the current block. If you don't provide the
       * level it will use the options.defaultLevel.
       */
      toggleHeading: (attrs: HeadingExtensionAttributes = {}): CommandFunction =>
        toggleBlockItem({
          type: this.type,
          toggleType: this.store.schema.nodes.paragraph,
          attrs,
        }),
    };
  }

  createKeymap(): KeyBindings {
    const keys: KeyBindings = object();

    this.options.levels.forEach((level) => {
      keys[`Shift-Ctrl-${level}`] = setBlockType(this.type, { level });
    });
    return keys;
  }

  createInputRules(): InputRule[] {
    return this.options.levels.map((level) =>
      textblockTypeInputRule(new RegExp(`^(#{1,${level}})\\s$`), this.type, () => ({ level })),
    );
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      heading: HeadingExtension;
    }
  }
}
