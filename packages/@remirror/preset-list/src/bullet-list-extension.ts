import {
  ApplySchemaAttributes,
  CommandFunction,
  extensionDecorator,
  ExtensionTag,
  KeyBindings,
  NodeExtension,
  NodeExtensionSpec,
} from '@remirror/core';
import { InputRule, wrappingInputRule } from '@remirror/pm/inputrules';

import { toggleList } from './list-commands';

/**
 * Creates the node for a bullet list.
 */
@extensionDecorator({})
export class BulletListExtension extends NodeExtension {
  get name() {
    return 'bulletList' as const;
  }

  readonly tags = [ExtensionTag.BlockNode, ExtensionTag.ListContainerNode];

  createNodeSpec(extra: ApplySchemaAttributes): NodeExtensionSpec {
    return {
      attrs: extra.defaults(),
      content: 'listItem+',
      parseDOM: [{ tag: 'ul', getAttrs: extra.parse }],
      toDOM: (node) => ['ul', extra.dom(node), 0],
    };
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
