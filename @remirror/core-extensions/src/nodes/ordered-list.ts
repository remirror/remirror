import { Cast, NodeExtension, NodeExtensionSpec, SchemaNodeTypeParams, toggleList } from '@remirror/core';
import { wrappingInputRule } from 'prosemirror-inputrules';

export class OrderedList extends NodeExtension {
  get name(): 'orderedList' {
    return 'orderedList';
  }

  get schema(): NodeExtensionSpec {
    return {
      attrs: {
        order: {
          default: 1,
        },
        ...this.extraAttrs(),
      },
      content: 'list_item+',
      group: 'block',
      parseDOM: [
        {
          tag: 'ol',
          getAttrs: dom => ({
            order: Cast<Element>(dom).hasAttribute('start') ? +Cast<Element>(dom).getAttribute('start')! : 1,
          }),
        },
      ],
      toDOM: node => (node.attrs.order === 1 ? ['ol', 0] : ['ol', { start: node.attrs.order }, 0]),
    };
  }

  public commands({ type, schema }: SchemaNodeTypeParams) {
    return () => toggleList(type, schema.nodes.list_item);
  }

  public keys({ type, schema }: SchemaNodeTypeParams) {
    return {
      'Shift-Ctrl-9': toggleList(type, schema.nodes.list_item),
    };
  }

  public inputRules({ type }: SchemaNodeTypeParams) {
    return [
      wrappingInputRule(
        /^(\d+)\.\s$/,
        type,
        match => ({ order: +match[1] }),
        (match, node) => node.childCount + node.attrs.order === +match[1],
      ),
    ];
  }
}
