import {
  ApplySchemaAttributes,
  CommandFunction,
  extension,
  ExtensionTag,
  KeyBindings,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
} from '@remirror/core';
import { InputRule, wrappingInputRule } from '@remirror/pm/inputrules';

import { toggleList } from './list-commands';
import { ListItemExtension } from './list-item-extension';

/**
 * Creates the node for a bullet list.
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
      parseDOM: [{ tag: 'ul', getAttrs: extra.parse }],
      toDOM: (node) => ['ul', extra.dom(node), 0],
    };
  }

  /**
   * Automatically add the `ListItemExtension` which is required here.
   */
  createExtensions() {
    return [new ListItemExtension()];
  }

  createCommands() {
    return {
      /**
       * Toggle the bullet list.
       */
      toggleBulletList: (): CommandFunction =>
        toggleList(this.type, this.store.schema.nodes.listItem),
    };
  }

  createKeymap(): KeyBindings {
    return {
      'Shift-Ctrl-8': toggleList(this.type, this.store.schema.nodes.listItem),
    };
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
