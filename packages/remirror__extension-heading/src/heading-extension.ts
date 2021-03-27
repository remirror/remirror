import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  CommandsExtension,
  extension,
  ExtensionTag,
  InputRule,
  KeyBindings,
  NamedShortcut,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
  object,
  ProsemirrorAttributes,
  ProsemirrorNode,
  setBlockType,
  Static,
  toggleBlockItem,
} from '@remirror/core';
import { textblockTypeInputRule } from '@remirror/pm/inputrules';
import { NodePasteRule } from '@remirror/pm/paste-rules';

import { shortcuts, toggleHeadingOptions } from './heading-constants';

export interface HeadingOptions {
  /**
   * The numerical value of the supporting headings.
   *
   * @default `[1, 2, 3, 4, 5, 6]`
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

@extension<HeadingOptions>({
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

  createTags() {
    return [ExtensionTag.Block, ExtensionTag.TextBlock, ExtensionTag.FormattingNode];
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      content: 'inline*',
      defining: true,
      draggable: false,
      ...override,
      attrs: {
        ...extra.defaults(),
        level: {
          default: this.options.defaultLevel,
        },
      },
      parseDOM: [
        ...this.options.levels.map((level) => ({
          tag: `h${level}`,
          getAttrs: (element: string | Node) => ({ ...extra.parse(element), level }),
        })),
        ...(override.parseDOM ?? []),
      ],
      toDOM: (node: ProsemirrorNode) => {
        if (!this.options.levels.includes(node.attrs.level)) {
          // Use the first level available
          return [`h${this.options.defaultLevel}`, extra.dom(node), 0];
        }

        return [`h${node.attrs.level as string}`, extra.dom(node), 0];
      },
    };
  }

  /**
   * Toggle the heading for the current block. If you don't provide the
   * level it will use the options.defaultLevel.
   */
  @command(toggleHeadingOptions)
  toggleHeading(attrs: HeadingExtensionAttributes = {}): CommandFunction {
    return toggleBlockItem({
      type: this.type,
      toggleType: 'paragraph',
      attrs,
    });
  }

  /**
   * Dynamically create the shortcuts for the heading extension.
   */
  createKeymap(fn: (shortcut: string) => string[]): KeyBindings {
    const commandsExtension = this.store.getExtension(CommandsExtension);
    const keys: KeyBindings = object();
    const attrShortcuts: Array<{ shortcut: string; attrs: ProsemirrorAttributes }> = [];

    for (const level of this.options.levels) {
      const shortcut = shortcuts[level - 1] ?? NamedShortcut.H1;
      keys[shortcut] = setBlockType(this.type, { level });

      // Dynamically add the attribute specific shortcut to the array of
      // attribute shortcuts.
      attrShortcuts.push({ attrs: { level }, shortcut: fn(shortcut)[0] as string });
    }

    commandsExtension.updateDecorated('toggleHeading', { shortcut: attrShortcuts });
    return keys;
  }

  createInputRules(): InputRule[] {
    return this.options.levels.map((level) => {
      return textblockTypeInputRule(new RegExp(`^(#{1,${level}})\\s$`), this.type, () => ({
        level,
      }));
    });
  }

  createPasteRules(): NodePasteRule[] {
    return this.options.levels.map((level) => ({
      type: 'node',
      nodeType: this.type,
      regexp: new RegExp(`^#{1,${level}}\\s([\\s\\w]+)$`),
      getAttributes: () => ({ level }),
      startOfTextBlock: true,
    }));
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      heading: HeadingExtension;
    }
  }
}
