import { toggleMark } from 'prosemirror-commands';

import {
  CommandMarkTypeParameter,
  convertCommand,
  ManagerMarkTypeParameter,
  KeyBindings,
  LEAF_NODE_REPLACING_CHARACTER,
  MarkExtension,
  MarkExtensionSpec,
  MarkGroup,
  markInputRule,
  markPasteRule,
} from '@remirror/core';

export class CodeExtension extends MarkExtension {
  get name() {
    return 'code' as const;
  }

  get schema(): MarkExtensionSpec {
    return {
      group: MarkGroup.Code,
      parseDOM: [{ tag: 'code' }],
      toDOM: () => ['code', 0],
    };
  }

  public keys({ type }: ManagerMarkTypeParameter): KeyBindings {
    return {
      'Mod-`': convertCommand(toggleMark(type)),
    };
  }

  public commands({ type }: CommandMarkTypeParameter) {
    return { code: () => toggleMark(type) };
  }

  public inputRules({ type }: ManagerMarkTypeParameter) {
    return [
      markInputRule({
        regexp: new RegExp(`(?:\`)([^\`${LEAF_NODE_REPLACING_CHARACTER}]+)(?:\`)$`),
        type,
      }),
    ];
  }

  public pasteRules({ type }: ManagerMarkTypeParameter) {
    return [markPasteRule({ regexp: /(?:`)([^`]+)(?:`)/g, type })];
  }
}
