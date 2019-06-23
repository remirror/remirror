import {
  CommandNodeTypeParams,
  NodeExtension,
  NodeExtensionSpec,
  SchemaNodeTypeParams,
  toggleList,
} from '@remirror/core';
import { wrappingInputRule } from 'prosemirror-inputrules';

export class BulletListExtension extends NodeExtension {
  get name() {
    return 'bulletList' as const;
  }

  get schema(): NodeExtensionSpec {
    return {
      attrs: this.extraAttrs(),
      content: 'listItem+',
      group: 'block',
      parseDOM: [{ tag: 'ul' }],
      toDOM: () => ['ul', 0],
    };
  }

  public commands({ type, schema }: CommandNodeTypeParams) {
    return () => toggleList(type, schema.nodes.listItem);
  }

  public keys({ type, schema }: SchemaNodeTypeParams) {
    return {
      'Shift-Ctrl-8': toggleList(type, schema.nodes.listItem),
    };
  }

  public inputRules({ type }: SchemaNodeTypeParams) {
    return [wrappingInputRule(/^\s*([-+*])\s$/, type)];
  }
}
