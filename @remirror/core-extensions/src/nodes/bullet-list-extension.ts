import { wrappingInputRule } from 'prosemirror-inputrules';

import {
  CommandNodeTypeParams,
  convertCommand,
  ExtensionManagerNodeTypeParams,
  KeyBindings,
  NodeExtension,
  NodeExtensionSpec,
  NodeGroup,
  toggleList,
} from '@remirror/core';

export class BulletListExtension extends NodeExtension {
  get name() {
    return 'bulletList' as const;
  }

  get schema(): NodeExtensionSpec {
    return {
      attrs: this.extraAttributes(),
      content: 'listItem+',
      group: NodeGroup.Block,
      parseDOM: [{ tag: 'ul' }],
      toDOM: () => ['ul', 0],
    };
  }

  public commands({ type, schema }: CommandNodeTypeParams) {
    return { toggleBulletList: () => toggleList(type, schema.nodes.listItem) };
  }

  public keys({ type, schema }: ExtensionManagerNodeTypeParams): KeyBindings {
    return {
      'Shift-Ctrl-8': convertCommand(toggleList(type, schema.nodes.listItem)),
    };
  }

  public inputRules({ type }: ExtensionManagerNodeTypeParams) {
    return [wrappingInputRule(/^\s*([*+-])\s$/, type)];
  }
}
