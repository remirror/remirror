import {
  NodeExtension,
  NodeExtensionSpec,
  SchemaNodeTypeParams,
  toggleList,
  wrappingInputRule,
} from '@remirror/core';

export class Bullet extends NodeExtension {
  get name() {
    return 'bullet_list';
  }

  get schema(): NodeExtensionSpec {
    return {
      content: 'list_item+',
      group: 'block',
      parseDOM: [{ tag: 'ul' }],
      toDOM: () => ['ul', 0],
    };
  }

  public commands({ type, schema }: SchemaNodeTypeParams) {
    return () => toggleList(type, schema.nodes.list_item);
  }

  public keys({ type, schema }: SchemaNodeTypeParams) {
    return {
      'Shift-Ctrl-8': toggleList(type, schema.nodes.list_item),
    };
  }

  public inputRules({ type }: SchemaNodeTypeParams) {
    return [wrappingInputRule(/^\s*([-+*])\s$/, type)];
  }
}
