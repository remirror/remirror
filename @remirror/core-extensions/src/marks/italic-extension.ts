import { toggleMark } from 'prosemirror-commands';

import {
  CommandMarkTypeParameter,
  convertCommand,
  ManagerMarkTypeParameter,
  KeyBindings,
  MarkExtension,
  MarkExtensionSpec,
  MarkGroup,
  markInputRule,
  markPasteRule,
} from '@remirror/core';

export class ItalicExtension extends MarkExtension {
  get name() {
    return 'italic' as const;
  }

  get schema(): MarkExtensionSpec {
    return {
      group: MarkGroup.FontStyle,
      parseDOM: [{ tag: 'i' }, { tag: 'em' }, { style: 'font-style=italic' }],
      toDOM: () => ['em', 0],
    };
  }

  public keys({ type }: ManagerMarkTypeParameter): KeyBindings {
    return {
      'Mod-i': convertCommand(toggleMark(type)),
    };
  }

  public commands({ type }: CommandMarkTypeParameter) {
    return { italic: () => toggleMark(type) };
  }

  public inputRules({ type }: ManagerMarkTypeParameter) {
    return [markInputRule({ regexp: /(?:^|[^*_])(?:\*|_)([^*_]+)(?:\*|_)$/, type })];
  }

  public pasteRules({ type }: ManagerMarkTypeParameter) {
    return [markPasteRule({ regexp: /(?:^|[^*_])(?:\*|_)([^*_]+)(?:\*|_)/g, type })];
  }
}
