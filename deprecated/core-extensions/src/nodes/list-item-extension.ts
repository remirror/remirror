import { liftListItem, sinkListItem, splitListItem } from '@remirror/pm/schema-list';

import {
  convertCommand,
  KeyBindings,
  ManagerNodeTypeParameter,
  NodeExtension,
  NodeExtensionSpec,
} from '@remirror/core';

export class ListItemExtension extends NodeExtension {
  get name() {
    return 'listItem' as const;
  }

  get schema(): NodeExtensionSpec {
    return {
      attrs: this.extraAttributes(),
      content: 'paragraph block*',
      defining: true,
      draggable: false,
      parseDOM: [{ tag: 'li' }],
      toDOM: () => ['li', 0],
    };
  }

  public keys({ type }: ManagerNodeTypeParameter): KeyBindings {
    return {
      Enter: convertCommand(splitListItem(type)),
      Tab: convertCommand(sinkListItem(type)),
      'Shift-Tab': convertCommand(liftListItem(type)),
    };
  }
}
