import { toggleMark } from 'prosemirror-commands';

import {
  CommandMarkTypeParameter,
  convertCommand,
  ManagerMarkTypeParameter,
  KeyBindings,
  MarkExtension,
  MarkExtensionSpec,
  MarkGroup,
} from '@remirror/core';

export class UnderlineExtension extends MarkExtension {
  get name() {
    return 'underline' as const;
  }

  get schema(): MarkExtensionSpec {
    return {
      group: MarkGroup.FontStyle,
      parseDOM: [
        {
          tag: 'u',
        },
        {
          style: 'text-decoration',
          getAttrs: (node) => (node === 'underline' ? {} : false),
        },
      ],
      toDOM: () => ['u', 0],
    };
  }

  public keys({ type }: ManagerMarkTypeParameter): KeyBindings {
    return {
      'Mod-u': convertCommand(toggleMark(type)),
    };
  }

  public commands({ type }: CommandMarkTypeParameter) {
    return { underline: () => toggleMark(type) };
  }
}
