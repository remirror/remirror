import {
  ApplySchemaAttributes,
  extensionDecorator,
  KeyBindings,
  NodeExtension,
  NodeExtensionSpec,
  NodeGroup,
  toggleList,
} from '@remirror/core';
import { wrappingInputRule } from '@remirror/pm/inputrules';

/**
 * Creates the node for a bullet list.
 */
@extensionDecorator({})
export class BulletListExtension extends NodeExtension {
  get name() {
    return 'bulletList' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes): NodeExtensionSpec {
    return {
      attrs: extra.defaults(),
      content: 'listItem+',
      group: NodeGroup.Block,
      parseDOM: [{ tag: 'ul', getAttrs: extra.parse }],
      toDOM: (node) => ['ul', extra.dom(node), 0],
    };
  }

  createCommands() {
    return {
      /**
       * Toggle the bullet list.
       */
      toggleBulletList: () => toggleList(this.type, this.store.schema.nodes.listItem),
    };
  }

  createKeymap(): KeyBindings {
    return {
      'Shift-Ctrl-8': toggleList(this.type, this.store.schema.nodes.listItem),
    };
  }

  createInputRules() {
    return [wrappingInputRule(/^\s*([*+-])\s$/, this.type)];
  }
}
