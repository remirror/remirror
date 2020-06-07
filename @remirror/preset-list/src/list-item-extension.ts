import {
  ApplyExtraAttributes,
  convertCommand,
  KeyBindings,
  NodeExtension,
  NodeExtensionSpec,
} from '@remirror/core';
import { liftListItem, sinkListItem, splitListItem } from '@remirror/pm/schema-list';

/**
 * Creates the node for a list item.
 */
export class ListItemExtension extends NodeExtension {
  get name() {
    return 'listItem' as const;
  }

  createNodeSpec(extra: ApplyExtraAttributes): NodeExtensionSpec {
    return {
      attrs: extra.defaults(),
      content: 'paragraph block*',
      defining: true,
      draggable: false,
      parseDOM: [{ tag: 'li', getAttrs: extra.parse }],
      toDOM: (node) => ['li', extra.dom(node.attrs), 0],
    };
  }

  createKeymap = (): KeyBindings => {
    return {
      Enter: convertCommand(splitListItem(this.type)),
      Tab: convertCommand(sinkListItem(this.type)),
      'Shift-Tab': convertCommand(liftListItem(this.type)),
    };
  };
}
