import {
  CommandNodeTypeParams,
  EDITOR_CLASS_SELECTOR,
  NodeExtension,
  NodeExtensionOptions,
  NodeExtensionSpec,
  NodeGroup,
  SchemaNodeTypeParams,
  toggleWrap,
} from '@remirror/core';
import { wrappingInputRule } from 'prosemirror-inputrules';

export class BlockquoteExtension extends NodeExtension<NodeExtensionOptions, 'blockquote', {}> {
  get name() {
    return 'blockquote' as const;
  }

  get schema(): NodeExtensionSpec {
    return {
      attrs: this.extraAttrs(),
      content: 'block*',
      group: NodeGroup.Block,
      defining: true,
      draggable: false,
      parseDOM: [{ tag: 'blockquote' }],
      toDOM: () => ['blockquote', 0],
    };
  }

  public commands({ type }: CommandNodeTypeParams) {
    return { blockquote: () => toggleWrap(type) };
  }

  public styles() {
    return `${EDITOR_CLASS_SELECTOR} blockquote {
      border-left: 2px solid #ddd;
      margin-left: 0;
      margin-right: 0;
      padding-left: 10px;
      font-style: italic;
    }
    ${EDITOR_CLASS_SELECTOR} blockquote p {
      color: #888;
    }
    `;
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
