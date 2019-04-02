import { MarkExtension, MarkExtensionSpec, SchemaMarkTypeParams } from '@remirror/core';
import { toggleMark } from 'prosemirror-commands';

export class Underline extends MarkExtension {
  get name() {
    return 'underline' as const;
  }

  get schema(): MarkExtensionSpec {
    return {
      parseDOM: [
        {
          tag: 'u',
        },
        {
          style: 'text-decoration',
          getAttrs: value => (value === 'underline' ? {} : false),
        },
      ],
      toDOM: () => ['u', 0],
    };
  }

  public keys({ type }: SchemaMarkTypeParams) {
    return {
      'Mod-u': toggleMark(type),
    };
  }

  public commands({ type }: SchemaMarkTypeParams) {
    return () => toggleMark(type);
  }
}
