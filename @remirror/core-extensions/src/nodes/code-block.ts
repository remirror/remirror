import { NodeExtension, NodeExtensionSpec, SchemaNodeTypeParams, toggleBlockItem } from '@remirror/core';
import { setBlockType } from 'prosemirror-commands';
import { textblockTypeInputRule } from 'prosemirror-inputrules';

export class CodeBlock extends NodeExtension {
  get name() {
    return 'codeBlock' as const;
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
    return [textblockTypeInputRule(/^```$/, type)];
  }
}
