import { liftListItem, sinkListItem, splitListItem } from 'prosemirror-schema-list';

import {
  ExtensionManagerNodeTypeParams,
  KeyBindings,
  NodeExtension,
  NodeExtensionSpec,
  convertCommand,
} from '@remirror/core';

export class ListItemExtension extends NodeExtension {
  get name() {
    return 'listItem' as const;
  }

  get schema(): NodeExtensionSpec {
    return {
      attrs: this.extraAttrs(),
      content: 'paragraph block*',
      defining: true,
      draggable: false,
      parseDOM: [{ tag: 'li' }],
      toDOM: () => ['li', 0],
    };
  }

  public keys({ type }: ExtensionManagerNodeTypeParams): KeyBindings {
    return {
      Enter: convertCommand(splitListItem(type)),
      Tab: convertCommand(sinkListItem(type)),
      'Shift-Tab': convertCommand(liftListItem(type)),
    };
  }
}
