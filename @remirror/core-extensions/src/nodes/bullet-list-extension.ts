import {
  CommandNodeTypeParams,
  ExtensionManagerNodeTypeParams,
  NodeExtension,
  NodeExtensionSpec,
  NodeGroup,
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
      group: NodeGroup.Block,
      parseDOM: [{ tag: 'ul' }],
      toDOM: () => ['ul', 0],
    };
  }

  public commands({ type, schema }: CommandNodeTypeParams) {
    return { toggleBulletList: () => toggleList(type, schema.nodes.listItem) };
  }

  public keys({ type, schema }: ExtensionManagerNodeTypeParams) {
    return {
      'Shift-Ctrl-8': toggleList(type, schema.nodes.listItem),
    };
  }

  public inputRules({ type }: ExtensionManagerNodeTypeParams) {
    return [wrappingInputRule(/^\s*([-+*])\s$/, type)];
  }
}
