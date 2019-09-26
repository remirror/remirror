import {
  CommandMarkTypeParams,
  ExtensionManagerMarkTypeParams,
  MarkExtension,
  MarkExtensionSpec,
  MarkGroup,
} from '@remirror/core';
import { toggleMark } from 'prosemirror-commands';

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
          getAttrs: node => (node === 'underline' ? {} : false),
        },
      ],
      toDOM: () => ['u', 0],
    };
  }

  public keys({ type }: ExtensionManagerMarkTypeParams) {
    return {
      'Mod-u': toggleMark(type),
    };
  }

  public commands({ type }: CommandMarkTypeParams) {
    return { underline: () => toggleMark(type) };
  }
}
