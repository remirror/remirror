import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  ExtensionTag,
  InputRule,
  keyBinding,
  KeyBindingProps,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
  toggleWrap,
} from '@remirror/core';
import { ExtensionBlockquoteMessages as Messages } from '@remirror/messages';
import { wrappingInputRule } from '@remirror/pm/inputrules';
import type { PasteRule } from '@remirror/pm/paste-rules';

/**
 * Add the blockquote block to the editor.
 */
export class BlockquoteExtension extends NodeExtension {
  get name() {
    return 'blockquote' as const;
  }

  createTags() {
    return [ExtensionTag.Block, ExtensionTag.FormattingNode];
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      content: 'block+',
      defining: true,
      draggable: false,
      ...override,
      attrs: extra.defaults(),
      parseDOM: [
        { tag: 'blockquote', getAttrs: extra.parse, priority: 100 },
        ...(override.parseDOM ?? []),
      ],
      toDOM: (node) => ['blockquote', extra.dom(node), 0],
    };
  }

  /**
   * Toggle the blockquote for the current block.
   *
   * If none exists one will be created or the existing blockquote content will be
   * lifted out of the blockquote node.
   *
   * ```ts
   * commands.toggleBlockquote();
   * ```
   */
  @command({
    icon: 'doubleQuotesL',
    description: ({ t }) => t(Messages.DESCRIPTION),
    label: ({ t }) => t(Messages.LABEL),
  })
  toggleBlockquote(): CommandFunction {
    return toggleWrap(this.type);
  }

  @keyBinding({ shortcut: 'Ctrl->', command: 'toggleBlockquote' })
  shortcut(props: KeyBindingProps): boolean {
    return this.toggleBlockquote()(props);
  }

  createInputRules(): InputRule[] {
    return [wrappingInputRule(/^\s*>\s$/, this.type)];
  }

  createPasteRules(): PasteRule {
    return {
      type: 'node',
      nodeType: this.type,
      regexp: /^\s*>\s$/,
      startOfTextBlock: true,
    };
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      blockquote: BlockquoteExtension;
    }
  }
}
