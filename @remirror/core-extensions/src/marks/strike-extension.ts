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

export class StrikeExtension extends MarkExtension {
  get name() {
    return 'strike' as const;
  }

  get schema(): MarkExtensionSpec {
    return {
      group: MarkGroup.FontStyle,
      parseDOM: [
        {
          tag: 's',
        },
        {
          tag: 'del',
        },
        {
          tag: 'strike',
        },
        {
          style: 'text-decoration',
          getAttrs: (node) => (node === 'line-through' ? {} : false),
        },
      ],
      toDOM: () => ['s', 0],
    };
  }

  public keys({ type }: ManagerMarkTypeParameter): KeyBindings {
    return {
      'Mod-d': convertCommand(toggleMark(type)),
    };
  }

  public commands({ type }: CommandMarkTypeParameter) {
    return { strike: () => toggleMark(type) };
  }

  public inputRules({ type }: ManagerMarkTypeParameter) {
    return [markInputRule({ regexp: /~([^~]+)~$/, type })];
  }

  public pasteRules({ type }: ManagerMarkTypeParameter) {
    return [markPasteRule({ regexp: /~([^~]+)~/g, type })];
  }
}
