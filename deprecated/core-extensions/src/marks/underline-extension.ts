import { toggleMark } from '@remirror/pm/commands';

import {
  CommandMarkTypeParameter,
  convertCommand,
  KeyBindings,
  ManagerMarkTypeParameter,
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

  keys({ type }: ManagerMarkTypeParameter): KeyBindings {
    return {
      'Mod-u': convertCommand(toggleMark(type)),
    };
  }

  commands({ type }: CommandMarkTypeParameter) {
    return { underline: () => toggleMark(type) };
  }
}
