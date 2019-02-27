import {
  NodeExtension,
  NodeExtensionSpec,
  SchemaNodeTypeParams,
  toggleWrap,
  wrappingInputRule,
} from '@remirror/core';

export class Blockquote extends NodeExtension {
  get name() {
    return 'blockquote';
  }

  get schema(): NodeExtensionSpec {
    return {
      attrs: this.extraAttrs(),
      content: 'block*',
      group: 'block',
      defining: true,
      draggable: false,
      parseDOM: [{ tag: 'blockquote' }],
      toDOM: () => ['blockquote', 0],
    };
  }

  public commands({ type }: SchemaNodeTypeParams) {
    return () => toggleWrap(type);
  }

  public keys({ type }: SchemaNodeTypeParams) {
    return {
      'Ctrl->': toggleWrap(type),
    };
  }

  public inputRules({ type }: SchemaNodeTypeParams) {
    return [wrappingInputRule(/^\s*>\s$/, type)];
  }
}
