import {
  ApplySchemaAttributes,
  CommandFunction,
  extensionDecorator,
  ExtensionTag,
  isElementDomNode,
  KeyBindings,
  NodeExtension,
  NodeExtensionSpec,
} from '@remirror/core';
import { InputRule, wrappingInputRule } from '@remirror/pm/inputrules';

import { toggleList } from './list-commands';

/**
 * Creates the list for the ordered list.
 */
@extensionDecorator({})
export class OrderedListExtension extends NodeExtension {
  get name() {
    return 'orderedList' as const;
  }

  readonly tags = [ExtensionTag.BlockNode, ExtensionTag.ListContainerNode];

  createNodeSpec(extra: ApplySchemaAttributes): NodeExtensionSpec {
    return {
      attrs: {
        ...extra.defaults(),
        order: {
          default: 1,
        },
      },
      content: 'listItem+',
      parseDOM: [
        {
          tag: 'ol',
          getAttrs: (node) => {
            if (!isElementDomNode(node)) {
              return {};
            }

            return {
              ...extra.parse(node),
              order: +(node.getAttribute('start') ?? 1),
            };
          },
        },
      ],
      toDOM: (node) => {
        const extraAttributes = extra.dom(node);

        return node.attrs.order === 1
          ? ['ol', extraAttributes, 0]
          : ['ol', { ...extraAttributes, start: node.attrs.order }, 0];
      },
    };
  }

  createCommands() {
    return {
      /**
       * Toggle the ordered list for the current selection.
       */
      toggleOrderedList: (): CommandFunction =>
        toggleList(this.type, this.store.schema.nodes.listItem),
    };
  }

  createKeymap(): KeyBindings {
    return {
      'Shift-Ctrl-9': toggleList(this.type, this.store.schema.nodes.listItem),
    };
  }

  createInputRules(): InputRule[] {
    return [
      wrappingInputRule(
        /^(\d+)\.\s$/,
        this.type,
        (match) => ({ order: +match[1] }),
        (match, node) => node.childCount + (node.attrs.order as number) === +match[1],
      ),
    ];
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      orderedList: OrderedListExtension;
    }
  }
}
