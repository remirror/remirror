import { wrappingInputRule } from '@remirror/pm/inputrules';

import {
  CommandNodeTypeParameter,
  convertCommand,
  KeyBindings,
  ManagerNodeTypeParameter,
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

  public commands({ type, schema }: CommandNodeTypeParameter) {
    return { toggleBulletList: () => toggleList(type, schema.nodes.listItem) };
  }

  public keys({ type, schema }: ManagerNodeTypeParameter): KeyBindings {
    return {
      'Shift-Ctrl-8': convertCommand(toggleList(type, schema.nodes.listItem)),
    };
  }

  public inputRules({ type }: ManagerNodeTypeParameter) {
    return [wrappingInputRule(/^\s*([*+-])\s$/, type)];
  }
}
