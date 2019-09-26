import {
  Cast,
  CommandNodeTypeParams,
  ExtensionManagerNodeTypeParams,
  NodeExtension,
  NodeExtensionSpec,
  NodeGroup,
  toggleList,
} from '@remirror/core';
import { wrappingInputRule } from 'prosemirror-inputrules';

export class OrderedListExtension extends NodeExtension {
  get name() {
    return 'orderedList' as const;
  }

  get schema(): NodeExtensionSpec {
    return {
      attrs: {
        order: {
          default: 1,
        },
        ...this.extraAttrs(),
      },
      content: 'listItem+',
      group: NodeGroup.Block,
      parseDOM: [
        {
          tag: 'ol',
          getAttrs: node => ({
            order: Cast<Element>(node).hasAttribute('start')
              ? +Cast<Element>(node).getAttribute('start')!
              : 1,
          }),
        },
      ],
      toDOM: node => (node.attrs.order === 1 ? ['ol', 0] : ['ol', { start: node.attrs.order }, 0]),
    };
  }

  public commands({ type, schema }: CommandNodeTypeParams) {
    return { toggleOrderedList: () => toggleList(type, schema.nodes.listItem) };
  }

  public keys({ type, schema }: ExtensionManagerNodeTypeParams) {
    return {
      'Shift-Ctrl-9': toggleList(type, schema.nodes.listItem),
    };
  }

  public inputRules({ type }: ExtensionManagerNodeTypeParams) {
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
