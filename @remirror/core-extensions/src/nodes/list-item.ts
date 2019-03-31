import { NodeExtension, NodeExtensionSpec, SchemaNodeTypeParams } from '@remirror/core';
import { liftListItem, sinkListItem, splitListItem } from 'prosemirror-schema-list';

export class ListItem extends NodeExtension {
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

  public keys({ type }: SchemaNodeTypeParams) {
    return {
      Enter: splitListItem(type),
      Tab: sinkListItem(type),
      'Shift-Tab': liftListItem(type),
    };
  }
}
