import { NodeExtension, NodeExtensionSpec, SchemaNodeTypeParams, toggleWrap } from '@remirror/core';
import { wrappingInputRule } from 'prosemirror-inputrules';

export class Blockquote extends NodeExtension {
  get name(): 'blockquote' {
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
