import {
  NodeExtension,
  NodeExtensionSpec,
  SchemaNodeTypeParams,
  setBlockType,
  textBlockTypeInputRule,
  toggleBlockItem,
} from '@remirror/core';

export class CodeBlock extends NodeExtension {
  get name(): 'codeBlock' {
    return 'codeBlock';
  }

  get schema(): NodeExtensionSpec {
    return {
      attrs: this.extraAttrs(),
      content: 'text*',
      marks: '',
      group: 'block',
      code: true,
      defining: true,
      draggable: false,
      parseDOM: [{ tag: 'pre', preserveWhitespace: 'full' }],
      toDOM: () => ['pre', ['code', 0]],
    };
  }

  public commands({ type, schema }: SchemaNodeTypeParams) {
    return () => toggleBlockItem(type, schema.nodes.paragraph);
  }

  public keys({ type }: SchemaNodeTypeParams) {
    return {
      'Shift-Ctrl-\\': setBlockType(type),
    };
  }

  public inputRules({ type }: SchemaNodeTypeParams) {
    return [textBlockTypeInputRule(/^```$/, type)];
  }
}
