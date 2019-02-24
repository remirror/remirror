import {
  liftListItem,
  NodeExtension,
  NodeExtensionSpec,
  SchemaNodeTypeParams,
  sinkListItem,
  splitListItem,
} from '@remirror/core';

export class ListItem extends NodeExtension {
  get name() {
    return 'list_item';
  }

  get schema(): NodeExtensionSpec {
    return {
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
