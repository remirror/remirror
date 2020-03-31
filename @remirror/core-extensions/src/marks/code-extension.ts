import { toggleMark } from 'prosemirror-commands';

import {
  CommandMarkTypeParams,
  convertCommand,
  ManagerMarkTypeParams,
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

  public keys({ type }: ManagerMarkTypeParams): KeyBindings {
    return {
      'Mod-`': convertCommand(toggleMark(type)),
    };
  }

  public commands({ type }: CommandMarkTypeParams) {
    return { code: () => toggleMark(type) };
  }

  public inputRules({ type }: ManagerMarkTypeParams) {
    return [
      markInputRule({
        regexp: new RegExp(`(?:\`)([^\`${LEAF_NODE_REPLACING_CHARACTER}]+)(?:\`)$`),
        type,
      }),
    ];
  }

  public pasteRules({ type }: ManagerMarkTypeParams) {
    return [markPasteRule({ regexp: /(?:`)([^`]+)(?:`)/g, type })];
  }
}
