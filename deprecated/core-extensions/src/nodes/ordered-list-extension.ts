import { wrappingInputRule } from '@remirror/pm/inputrules';

import {
  CommandNodeTypeParameter,
  convertCommand,
  isElementDOMNode,
  KeyBindings,
  ManagerNodeTypeParameter,
  NodeExtension,
  NodeExtensionSpec,
  NodeGroup,
  toggleList,
} from '@remirror/core';

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
        ...this.extraAttributes(),
      },
      content: 'listItem+',
      group: NodeGroup.Block,
      parseDOM: [
        {
          tag: 'ol',
          getAttrs: (node) => {
            if (!isElementDOMNode(node)) {
              return {};
            }

            return {
              order: +(node.getAttribute('start') ?? 1),
            };
          },
        },
      ],
      toDOM: (node) =>
        node.attrs.order === 1 ? ['ol', 0] : ['ol', { start: node.attrs.order }, 0],
    };
  }

  public commands({ type, schema }: CommandNodeTypeParameter) {
    return { toggleOrderedList: () => toggleList(type, schema.nodes.listItem) };
  }

  public keys({ type, schema }: ManagerNodeTypeParameter): KeyBindings {
    return {
      'Shift-Ctrl-9': convertCommand(toggleList(type, schema.nodes.listItem)),
    };
  }

  public inputRules({ type }: ManagerNodeTypeParameter) {
    return [
      wrappingInputRule(
        /^(\d+)\.\s$/,
        type,
        (match) => ({ order: +match[1] }),
        (match, node) => node.childCount + (node.attrs.order as number) === +match[1],
      ),
    ];
  }
}
