import { MarkExtension, MarkExtensionSpec, SchemaMarkTypeParams, toggleMark } from '@remirror/core';

export class Underline extends MarkExtension {
  get name(): 'underline' {
    return 'underline';
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
