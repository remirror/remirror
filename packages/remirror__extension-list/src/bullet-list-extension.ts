import {
  ApplySchemaAttributes,
  assertGet,
  command,
  CommandFunction,
  extension,
  ExtensionTag,
  keyBinding,
  KeyBindingProps,
  NamedShortcut,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
} from '@remirror/core';
import { ExtensionListMessages as Messages } from '@remirror/messages';
import { InputRule, wrappingInputRule } from '@remirror/pm/inputrules';

import { toggleList } from './list-commands';
import { ListItemExtension } from './list-item-extension';

/**
 * Create the node for a bullet list.
 */
@extension({})
export class BulletListExtension extends NodeExtension {
  get name() {
    return 'bulletList' as const;
  }

  createTags() {
    return [ExtensionTag.Block, ExtensionTag.ListContainerNode];
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      content: 'listItem+',
      ...override,
      attrs: extra.defaults(),
      parseDOM: [{ tag: 'ul', getAttrs: extra.parse }, ...(override.parseDOM ?? [])],
      toDOM: (node) => ['ul', extra.dom(node), 0],
    };
  }

  /**
   * Automatically add the `ListItemExtension` which is required here.
   */
  createExtensions() {
    return [new ListItemExtension()];
  }

  /**
   * Toggle the bullet list for the current selection.
   */
  @command({ icon: 'listUnordered', label: ({ t }) => t(Messages.BULLET_LIST_LABEL) })
  toggleBulletList(): CommandFunction {
    return toggleList(this.type, assertGet(this.store.schema.nodes, 'listItem'));
  }

  @keyBinding({ shortcut: NamedShortcut.BulletList, command: 'toggleBulletList' })
  listShortcut(props: KeyBindingProps): boolean {
    return this.toggleBulletList()(props);
  }

  createInputRules(): InputRule[] {
    return [wrappingInputRule(/^\s*([*+-])\s$/, this.type)];
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      bulletList: BulletListExtension;
    }
  }
}
